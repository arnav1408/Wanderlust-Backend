import mongoose from 'mongoose';
import PostMessage from '../models/postMessage.js';

export const getPosts = async (req, res) => {
    const { page } = req.query;

    try {
        const LIMIT = 9;
        const startPage = (Number(page) - 1) * LIMIT;
        const totalPosts = await PostMessage.countDocuments({});

        const posts = await PostMessage.find().sort({ _id: -1 }).limit(LIMIT).skip(startPage);

        res.status(200).json({
            data: posts,
            currentPage: Number(page),
            numberOfPages: Math.ceil(totalPosts / LIMIT)
        });
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
}

export const getPost = async (req, res) => {
    const { id } = req.params;

    try {
        const post = await PostMessage.findById(id);

        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
}

export const getPostsBySearch = async (req, res) => {
    const { searchQuery, tags } = req.query;
    try {
        const title = new RegExp(searchQuery, 'i');
        // console.log(title);
        const updatedTags = tags.split(',').map((tag) => tag.trim().toLowerCase()).join(',');
        // const tagss = new RegExp(tags, 'i');
        // console.log(updatedTags);

        const posts = await PostMessage.find({
            $or: [
                {
                    title
                },
                {
                    tags: {
                        $in: updatedTags.split(',')
                    }
                }
            ]
        });

        res.json({
            data: posts
        });
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
}

export const createPosts = async (req, res) => {
    const post = req.body;

    const newPost = new PostMessage({
        ...post,
        creator: req.userId,
        createdAt: new Date().toISOString()
    });
    try {
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(409).json({
            message: error.message
        });
    }
}

export const updatePost = async (req, res) => {
    // console.log(req.params);
    const { id: _id } = req.params;

    const post = req.body;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).send('No post with that ID');
    }

    const updatedPost = await PostMessage.findByIdAndUpdate(_id, {...post, _id}, {new: true});

    res.json(updatedPost);
}

export const deletePost = async (req, res) => {
    const { id: _id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).send('No post with that ID');
    }

    await PostMessage.findByIdAndRemove(_id);

    res.json({ message: 'Post deleted successfully!' });
}

export const likePost = async (req, res) => {
    const { id: _id } = req.params;

    if (!req.userId) {
        return res.json({
            message: 'Unauthenticated!'
        });
    }

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).send('No post with that ID');
    }

    const post = await PostMessage.findById(_id);

    const index = post.likes.findIndex((id) => id === String(req.userId));

    if (index === -1) {
        post.likes.push(req.userId);
    } else {
        post.likes = post.likes.filter((id) => id !== String(req.userId));
    }

    const updatedPost = await PostMessage.findByIdAndUpdate(_id, post, { new: true });
    // console.log(updatedPost);
    res.json(updatedPost);
};

export const commentPost = async (req, res) => {
    const { id } = req.params;
    const { value } = req.body;

    try {
        const post = await PostMessage.findById(id);

        post.comments.push(value);

        const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true });
        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
}