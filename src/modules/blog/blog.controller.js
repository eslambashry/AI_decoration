import { Blog } from "../../../Database/models/blog.model.js";

const addBlog = async (req, res, next) => {
  try {
    const { title, content, author, image } = req.body;
    const blog = new Blog({ title, content, author, image });
    blog.save();
    res.status(201).json({ message: "Blog added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
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
    try {
      const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      res.status(200).json({ message: "Blog updated successfully", blog });
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
}

const deleteBlog = async (req, res, next) => {
    try {
      const blog = await Blog.findByIdAndDelete(req.params.id);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error" });
    }
}

export { addBlog, getAllBlogs, getBlog, updateBlog, deleteBlog };