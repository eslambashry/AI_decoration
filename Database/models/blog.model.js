import mongoose, { Schema } from "mongoose";

const blogSchema = new Schema({
  title: {
    en: { type: String, required: true, minlength: 5, maxlength: 100 },
    ar:{ type: String, required: true, minlength: 5, maxlength: 100 }
  },
  content: {
    en: { type: String, required: true, minlength: 10, maxlength: 10000 },
    ar:{ type: String, required: true, minlength: 10, maxlength: 10000 }
  },
  caption: {
    en: { type: String, required: true, minlength: 5, maxlength: 300 },
    ar:{ type: String, required: true, minlength: 5, maxlength: 300 }
  },
  // author: {
  //     type: Schema.Types.ObjectId,
  //     ref: "User",
  //     required: true
  // },
  image: {
    secure_url: String,
    public_id: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  customId: String,
});

export const Blog = mongoose.model("Blog", blogSchema);
