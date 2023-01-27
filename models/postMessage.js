import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    title: String,
    message: String,
    name: String,
    creator: String,
    tags: [String],
    comments: {
        type: [String],
        default: []
    },
    selectedFile: String,
    likes: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
});

const PostMessage = mongoose.model('PostMessage', postSchema);

export default PostMessage;