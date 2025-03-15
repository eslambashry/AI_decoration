import express from 'express';
import { addBlog, deleteBlog, getAllBlogs, getBlog, updateBlog } from './blog.controller.js';

const blogRouter = express.Router();

blogRouter.get('/getallblogs',getAllBlogs)
blogRouter.get('/getblog/:id',getBlog)
blogRouter.put('/updateblog/:id',updateBlog)
blogRouter.post('/addblog/:id',addBlog)
blogRouter.delete('/deleteblog/:id',deleteBlog)


export default blogRouter;