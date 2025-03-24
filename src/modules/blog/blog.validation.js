import Joi from "joi";


const blogSchema = Joi.object({
    title: Joi.string().required().min(5).max(50).messages({
        "string.empty": "Title is required",
        "string.min": "Title must have at least 5 characters",
        "string.max": "Title can have a maximum of 50 characters"
    })
    ,
    content: Joi.string().required().min(10).max(5000).messages({
        "string.empty": "Content is required",
        "string.min": "Content must have at least 10 characters",
        "string.max": "Content can have a maximum of 5000 characters"
    })
});

export default blogSchema