import ImageKit from "imagekit";
import { config } from 'dotenv'
import path from 'path'
config({path: path.resolve('./config/.env')})
import { promisify } from 'util';
import fs from 'fs';

var imagekit = new ImageKit({
    publicKey : process.env.PUBLIC_IMAGEKIT_KEY,
    privateKey : process.env.PRIVATE_IMAGEKIT_KEY,
    urlEndpoint : process.env.URL_ENDPOINT
});


export const destroyImage = async (fileId) => {
    try {
      const result = await imagekit.deleteFile(fileId);  // Delete the file using its fileId
      console.log('File deleted:', result);
      return result;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete image from ImageKit');
    }
  };

  // Convert fs.writeFile into a promise-based function
export const writeFileAsync = promisify(fs.writeFile);

// Function to upload the PDF to ImageKit
export const uploadToImageKit = async (fileBuffer, fileName) => {
    try {
        // Convert the PDF buffer to binary format (base64 can also be used)
        const base64FileContent = fileBuffer.toString('base64');

        // Upload the PDF to ImageKit
        const result = await imagekit.upload({
            file: base64FileContent, // Base64 encoded file content
            fileName: fileName, // File name
            useUniqueFileName: true,  // Ensure the file name is unique
            folder: '/invoices/',  // Optional: specify a folder
            isPrivateFile: false,  // Public file
        });

        return result; // Return the result which contains the file URL
    } catch (error) {
        console.error('Error uploading PDF to ImageKit:', error);
        throw new Error('Failed to upload PDF to ImageKit');
    }
};
export default imagekit;
