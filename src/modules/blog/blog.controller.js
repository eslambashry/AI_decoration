import { Blog } from "../../../Database/models/blog.model.js";
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 5)
import imagekit, { destroyImage } from "../../utilities/imageKitConfigration.js";
import CustomError from "../../utilities/customError.js";


const addBlog = async (req, res, next) => {
    const { title, content, caption} = req.body;
    if (!req.file) {
      return next(new CustomError('Please upload an image.', 400));
    }
    const customId = nanoid();

    const uploadResult = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: `${process.env.PROJECT_FOLDER}/Blogs/${customId}`,
    });

    if (!uploadResult || !uploadResult.url) {
      return next(new CustomError('Image upload failed. Please try again.', 500));
    }

    const blog = new Blog({ title, content, caption,customId, 
      image: {
        secure_url: uploadResult.url,
        public_id: uploadResult.fileId,
      },
     });
    blog.save();
    res.status(201).json({ message: "Blog added successfully" });
};

const getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json({ message: "Success", blogs });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

const getBlog = async (req, res, next) => {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      res.status(200).json({ message: "Success", blog });
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
}

const updateBlog = async (req, res, next) => {

  // console.log();
  
      const blog = await Blog.findById(req.params.id);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      
     if(req.body.title)  blog.title =req.body.title
     if(req.body.content) blog.content = req.body.content;
     if(req.body.caption) blog.caption = req.body.caption;

      if (req.file) {
        const uploadResult = await imagekit.upload({
          file: req.file.buffer,
          fileName: req.file.originalname,
          folder: `${process.env.PROJECT_FOLDER}/Blogs/${blog.customId}`,
        });
        blog.image.secure_url = uploadResult.url;
        blog.image.public_id = uploadResult.fileId;
      }


      await blog.save();

      res.status(200).json({ message: "Blog updated successfully", blog });
}

const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    
    if (blog.image && blog.image.public_id) {
      try {
        await destroyImage(blog.image.public_id);
      } catch (imageError) {
        console.error("Error deleting image:", imageError);
      }
    }
    
    await Blog.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ message: "Error deleting blog", error: error.message });
  }
};



export { addBlog, getAllBlogs, getBlog, updateBlog, deleteBlog };