import axios from "axios";
import { userModel } from "../../../Database/models/user.model.js";
import imagekit from "../../utilities/imageKitConfigration.js";
import CustomError from "../../utilities/customError.js";
import catchError from "../../middleware/ErrorHandeling.js";
import {DesignModel} from "../../../Database/models/generate_designs_for_room.model.js"
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 5)


// ^ ===================== generate ai decoration with image ================================
export const createWithImage = catchError(async (req, res, next) => {
    const user = await userModel.findById(req.authUser._id);
    if (!user) {
      return next(new CustomError('User not found.', 404));
    }
    console.log(req.body);

    if (user.totalDesignsAvailable <= 0) {
      return next(new CustomError('No designs available. Please purchase a plan.', 400));
    }

    if (!req.file) {
      return next(new CustomError('Please upload an image.', 400));
    }

    const { room_type, design_style, num_images } = req.body;
    if (!room_type || !design_style || !num_images) {
      return next(new CustomError('Missing required fields: room_type, design_style, num_images.', 400));
    }

    const customId = nanoid();
    // console.log(req.file);
 
    const uploadResult = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: `${process.env.PROJECT_FOLDER}/Users_images/${customId}`,
    });

    if (!uploadResult || !uploadResult.url) {
      return next(new CustomError('Image upload failed. Please try again.', 500));
    }

    const apiToken = process.env.Decoration_AI_TOKEN;
    const apiResponse = await axios.post(
      process.env.Virtual_Staging_And_Interior_Design,
      {
        input_image_url: uploadResult.url,
        room_type,
        design_style,
        num_images: parseInt(num_images, 10),
        color_scheme: req.body.colorScheme || "COLOR_SCHEME_0",
        speciality_decor: req.body.specialityDecor || "SPECIALITY_DECOR_0",
      },
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`
        }
      }
    );
    console.log(apiResponse);

    
    // console.log(generatedImages);
    
    if (apiResponse.data && apiResponse.data.error) {
      // Check if there is an error in the API response
      return next(new CustomError(apiResponse.data.message || 'AI processing failed. Please try again.', 500));
    }    
    
    const generatedImages = apiResponse.data.info.images;
    
    if (!apiResponse.data || !generatedImages || !generatedImages.length) {
      return next(new CustomError('AI processing failed. Please try again.', 500));
    }
    

      // Upload generated images to ImageKit
      const uploadedGeneratedImages = [];
      for (const image of generatedImages) {
        const generatedImageBuffer = await axios({
          url: image.url,
          method: 'GET',
          responseType: 'arraybuffer',
        }).then(response => response.data);
  
        const generatedImageUpload = await imagekit.upload({
          file: generatedImageBuffer,
          fileName: `${customId}-${image.uuid}.jpg`,
          folder: `${process.env.PROJECT_FOLDER}/Generated_Images/${customId}`,
        });
  
        if (!generatedImageUpload || !generatedImageUpload.url) {
          return next(new CustomError('Generated image upload failed. Please try again.', 500));
        }
  

        uploadedGeneratedImages.push({
          secure_url: generatedImageUpload.url,
          public_id: generatedImageUpload.fileId
        });
      }
    
    
    await userModel.findByIdAndUpdate(req.authUser._id, {
      $inc: { totalDesignsAvailable: -1 }
    });
    
    const newDesign = new DesignModel({
      userId: user._id,
      uploadedImage: {
        secure_url: uploadResult.url,
        public_id: uploadResult.fileId,
      },
      generatedImage: uploadedGeneratedImages,
      roomType: room_type,
      designStyle: design_style,
      numImages: num_images,
      colorScheme: req.body.colorScheme,
      specialityDecor: req.body.specialityDecor,
      customId: customId,
    });

    await newDesign.save();

    res.status(200).json({
      message: "Image processed successfully",
      uploadedImage: {
        secure_url: uploadResult.url,
        public_id: uploadResult.fileId,
      },
      generatedImages: uploadedGeneratedImages,
      remainingDesigns: user.totalDesignsAvailable - 1
    });
});


export const createwithoutImage = catchError(async (req,res,next) => {
    // Check if user has available designs
    const user = await userModel.findById(req.authUser._id);
    if (!user) {
      return next(new CustomError('User not found.', 404));
    }

    if (user.totalDesignsAvailable <= 0) {
      return next(new CustomError('No designs available. Please purchase a plan.', 400));
    }

    console.log(req.body);
    // Validate request body
    const { room_type, design_style, num_images } = req.body;
    if (!room_type || !design_style || !num_images) {
      return next(new CustomError('Missing required fields: room_type, design_style, num_images.', 400));
    }

    const apiToken = process.env.Decoration_AI_TOKEN;
    const apiResponse = await axios.post(
      process.env.Generate_Inspirational_Designs,
      {
        room_type,
        design_style,
        num_images: num_images,
        color_scheme: req.body.colorScheme || "COLOR_SCHEME_0",
        speciality_decor: req.body.specialityDecor || "SPECIALITY_DECOR_0",
      },
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`
        }
      }
    );
    

    // console.log(apiResponse);
    
    const generatedImages = apiResponse.data.info.images;

    // console.log(generatedImages);
    
    if (!apiResponse.data || !generatedImages || !generatedImages.length) {
      return next(new CustomError('AI processing failed. Please try again.', 500));
    }
    // Decrease available designs count
    await userModel.findByIdAndUpdate(req.authUser._id, {
      $inc: { totalDesignsAvailable: -1 }
    });

    // Save to MongoDB
    const newDesign = new DesignModel({
      userId: user._id,
      generatedImage: generatedImages.map(image => image.url),
      roomType: room_type,
      designStyle: design_style,
      numImages: num_images,
      colorScheme: req.body.colorScheme,
      specialityDecor: req.body.specialityDecor,
    });

    await newDesign.save();

    res.status(200).json({
      message: "Image processed successfully",
      generatedImages: generatedImages.map(image => image.url),
      remainingDesigns: user.totalDesignsAvailable - 1
    });
})

export const getDesignById = catchError(async (req, res, next) => {
  const userId = req.authUser._id;
  if(!userId) return next(new CustomError('User not found', 404));
  const designs = await DesignModel.find({ userId: userId }).sort({ createdAt: -1 });
  if(!designs) return next(new CustomError('No designs found', 404));
  res.status(200).json({ designs });
})



