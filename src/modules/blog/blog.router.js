import express from 'express';
import { addBlog, deleteBlog, getAllBlogs, getBlog, updateBlog } from './blog.controller.js';
import { multerCloudFunction } from '../../services/multerCloud.js';
import { allowedExtensions } from '../../utilities/allowedExtentions.js';

const blogRouter = express.Router();

blogRouter.get('/getallblogs',getAllBlogs)
blogRouter.get('/getblog/:id',getBlog)
blogRouter.put('/updateblog/:id',multerCloudFunction(allowedExtensions.Image).single('image'),updateBlog)
blogRouter.post('/addblog',multerCloudFunction(allowedExtensions.Image).single('image'),addBlog)
blogRouter.delete('/deleteblog/:id',deleteBlog)


export default blogRouter;