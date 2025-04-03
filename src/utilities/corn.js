import { scheduleJob } from "node-schedule";
import moment from "moment";
import { Payment } from "../../Database/models/payment.model.js";
import { userModel } from "../../Database/models/user.model.js";
import { DesignModel } from "../../Database/models/generate_designs_for_room.model.js";
import { destroyImage } from "./imageKitConfigration.js";
import { sendEmailService } from "../services/sendEmail.js";

export const cleanupExpiredDesignsCron = () => {
    // Run daily at midnight
    scheduleJob('0 0 * * *', async function() {
        try {
            console.log("Running cleanup for expired designs storage");
            
            // Get all completed payments
            const payments = await Payment.find({ status: 'completed' });
            
            for (const payment of payments) {
                // Calculate when storage should expire
                const monthsToAdd = typeof payment.storageMonths === 'number' ? 
                    payment.storageMonths : 
                    (payment.planId === 'PLAN_1' ? 3 : 6); // Default based on plan
                
                const storageEndDate = moment(payment.createdAt).add(monthsToAdd, 'months');
                
                if (moment().isAfter(storageEndDate)) {
                    // Find the user
                    const user = await userModel.findById(payment.userId);
                    
                    if (user) {
                        console.log("user corn",user);
                        
                        try {
                            // Find designs created by this user during the period covered by this payment
                            const paymentDate = moment(payment.createdAt);
                            
                            const designs = await DesignModel.find({
                                userId: user._id,
                                createdAt: { 
                                    $gte: paymentDate.toDate(),
                                    $lte: storageEndDate.toDate()
                                }
                            });
                            
                            console.log(`Found ${designs.length} expired designs for user: ${user._id}, payment ID: ${payment._id}`);
                            
                            // Delete the designs and their associated images
                            for (const design of designs) {
                                // Delete uploaded original image from ImageKit
                                if (design.uploadedImage && design.uploadedImage.public_id) {
                                    try {
                                        await destroyImage(design.uploadedImage.public_id);
                                        console.log(`Deleted original image ${design.uploadedImage.public_id} for design ${design.customId}`);
                                    } catch (err) {
                                        console.error(`Error deleting original image ${design.uploadedImage.public_id}:`, err);
                                    }
                                }
                                
                                // For generated images, we need to find the file IDs
                                // Since we don't store the file IDs directly, we'll use the folder structure
                                try {
                                    // List all files in the design's folder
                                    const generatedImagesFolder = `Roomo/Generated_Images/${design.customId}`;
                                    const files = await imagekit.listFiles({
                                        path: generatedImagesFolder
                                    });
                                    
                                    // Delete each file
                                    for (const file of files) {
                                        await destroyImage(file.fileId);
                                        console.log(`Deleted generated image ${file.fileId} from folder ${generatedImagesFolder}`);
                                    }
                                } catch (err) {
                                    console.error(`Error deleting generated images for design ${design.customId}:`, err);
                                    
                                    // Fallback: Try to extract file IDs from URLs if folder listing fails
                                    for (const imageUrl of design.generatedImage) {
                                        try {
                                            // Extract the filename from the URL
                                            const urlParts = imageUrl.split('/');
                                            const fileName = urlParts[urlParts.length - 1];
                                            
                                            // Get the file ID by removing the extension
                                            const fileId = fileName.split('.')[0];
                                            
                                            await destroyImage(fileId);
                                            console.log(`Deleted generated image ${fileId} using URL extraction fallback`);
                                        } catch (deleteErr) {
                                            console.error(`Failed to delete image from URL ${imageUrl}:`, deleteErr);
                                        }
                                    }
                                }
                                
                                // Delete the design record from the database
                                await DesignModel.findByIdAndDelete(design._id);
                                console.log(`Deleted design record ${design._id} (${design.customId})`);
                            }
                            
                            console.log(`Completed cleanup of ${designs.length} expired designs for user: ${user._id}`);
                            
                            // Optionally notify the user that their designs have been removed
                            await sendEmailService({
                                to: user.email,
                                subject: 'Your DecorAI Designs Storage Period Has Expired',
                                message: `Your designs from plan ${payment.planId} have reached the end of their ${monthsToAdd}-month storage period and have been removed.`
                            });
                        } catch (err) {
                            console.error(`Error processing designs for user ${user._id}:`, err);
                        }
                    }
                }
            }
            
            console.log("Expired designs cleanup completed");
        } catch (error) {
            console.error("Error in cleanupExpiredDesignsCron:", error);
        }
    });
};
