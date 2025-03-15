import mongoose, { Schema } from "mongoose"


const blogSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 50
    },
    content: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 5000
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    image:{
        type: String,
    }
})

export const Blog = mongoose.model("Blog", blogSchema)