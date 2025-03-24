import express from "express";
import {
  addBlog,
  deleteBlog,
  getAllArabicBlogs,
  getAllEnglishBlogs,
  getBlog,
  updateBlog,
} from "./blog.controller.js";
import { multerCloudFunction } from "../../services/multerCloud.js";
import { allowedExtensions } from "../../utilities/allowedExtentions.js";
import { validation } from "../../middleware/validation.js";
import blogSchema from "./blog.validation.js";

const blogRouter = express.Router();

blogRouter.get("/getarblogs", getAllArabicBlogs);
blogRouter.get("/getenblogs", getAllEnglishBlogs);
blogRouter.get("/getblog/:id", getBlog);
blogRouter.put(
  "/updateblog/:id",
  multerCloudFunction(allowedExtensions.Image).single("image"),
  validation(blogSchema),
  updateBlog
);
blogRouter.post(
  "/addblog",
  multerCloudFunction(allowedExtensions.Image).single("image"),
  validation(blogSchema),
  addBlog
);
blogRouter.delete("/deleteblog/:id", deleteBlog);

export default blogRouter;
