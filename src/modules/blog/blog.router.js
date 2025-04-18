import express from "express";
import {
  addBlog,
  deleteBlog,
  getAllArabicBlogs,
  getAllEnglishBlogs,
  getBlog,
  updateBlog,
  getAllBlogs
} from "./blog.controller.js";
import { multerCloudFunction } from "../../services/multerCloud.js";
import { allowedExtensions } from "../../utilities/allowedExtentions.js";
import { validation, validationWithParams } from "../../middleware/validation.js";
import {blogSchema , updateBlogSchema}from "./blog.validation.js";
import { isAuth } from "../../middleware/isAuth.js";
import { systemRoles } from "../../utilities/systemRole.js";

const blogRouter = express.Router();

blogRouter.get("/getallblogs", getAllBlogs);
blogRouter.get("/getarblogs", getAllArabicBlogs);
blogRouter.get("/getenblogs", getAllEnglishBlogs);
blogRouter.get("/getOne/:id", getBlog);


blogRouter.put(
  "/update/:id",isAuth([systemRoles.ADMIN]),
  multerCloudFunction(allowedExtensions.Image).single("image"),
  validationWithParams(updateBlogSchema),
  updateBlog
);


blogRouter.post(
  "/create",isAuth([systemRoles.ADMIN]),
  multerCloudFunction(allowedExtensions.Image).single("image"),
  validation(blogSchema),
  addBlog
);


blogRouter.delete("/delete/:id", isAuth([systemRoles.ADMIN]) ,deleteBlog);

export default blogRouter;
