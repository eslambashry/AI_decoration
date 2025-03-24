import Joi from "joi";


const blogSchema = Joi.object({
    title: Joi.object({
      en: Joi.string().required().min(5).max(50).messages({
        "string.empty": "English title is required",
        "string.min": "English title must have at least 5 characters",
        "string.max": "English title can have a maximum of 50 characters",
        "any.required": "English title is required"
      }),
      ar: Joi.string().required().min(5).max(50).messages({
        "string.empty": "Arabic title is required",
        "string.min": "Arabic title must have at least 5 characters",
        "string.max": "Arabic title can have a maximum of 50 characters",
        "any.required": "Arabic title is required"
      })
    }).required().messages({
      "object.base": "Title must be an object with 'en' and 'ar' properties",
      "any.required": "Title is required"
    }),
    
    content: Joi.object({
      en: Joi.string().required().min(10).max(5000).messages({
        "string.empty": "English content is required",
        "string.min": "English content must have at least 10 characters",
        "string.max": "English content can have a maximum of 5000 characters",
        "any.required": "English content is required"
      }),
      ar: Joi.string().required().min(10).max(5000).messages({
        "string.empty": "Arabic content is required",
        "string.min": "Arabic content must have at least 10 characters",
        "string.max": "Arabic content can have a maximum of 5000 characters",
        "any.required": "Arabic content is required"
      })
    }).required().messages({
      "object.base": "Content must be an object with 'en' and 'ar' properties",
      "any.required": "Content is required"
    }),
    
    caption: Joi.object({
      en: Joi.string().required().min(5).max(100).messages({
        "string.empty": "English caption is required",
        "string.min": "English caption must have at least 5 characters",
        "string.max": "English caption can have a maximum of 100 characters",
        "any.required": "English caption is required"
      }),
      ar: Joi.string().required().min(5).max(100).messages({
        "string.empty": "Arabic caption is required",
        "string.min": "Arabic caption must have at least 5 characters",
        "string.max": "Arabic caption can have a maximum of 100 characters",
        "any.required": "Arabic caption is required"
      })
    }).required().messages({
      "object.base": "Caption must be an object with 'en' and 'ar' properties",
      "any.required": "Caption is required"
    })
  });
  
  // Schema for updating an existing blog
const updateBlogSchema = Joi.object({
    id: Joi.string().required(),

    title: Joi.object({
      en: Joi.string().min(5).max(100).messages({
        "string.min": "English title must have at least 5 characters",
        "string.max": "English title can have a maximum of 100 characters"
      }),
      ar: Joi.string().min(5).max(100).messages({
        "string.min": "Arabic title must have at least 5 characters",
        "string.max": "Arabic title can have a maximum of 100 characters"
      })
    }).optional(),
    
    content: Joi.object({
      en: Joi.string().min(10).max(5000).messages({
        "string.min": "English content must have at least 10 characters",
        "string.max": "English content can have a maximum of 5000 characters"
      }),
      ar: Joi.string().min(10).max(5000).messages({
        "string.min": "Arabic content must have at least 10 characters",
        "string.max": "Arabic content can have a maximum of 5000 characters"
      })
    }).optional(),
    
    caption: Joi.object({
      en: Joi.string().min(5).max(300).messages({
        "string.min": "English caption must have at least 5 characters",
        "string.max": "English caption can have a maximum of 300 characters"
      }),
      ar: Joi.string().min(5).max(300).messages({
        "string.min": "Arabic caption must have at least 5 characters",
        "string.max": "Arabic caption can have a maximum of 300 characters"
      })
    }).optional()
  });

export {
    blogSchema,
    updateBlogSchema
}