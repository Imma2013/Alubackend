const express = require('express');
const router = express.Router();
const { Post, Comment, Notification } = require('../config/db');
const clerkAuth = require('../middleware/clerkAuth');

// ─── GET single post by ID (public — for share links) ───
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const commentCount = await Comment.countDocuments({ postId: post._id });
        res.json({ post: { ...post.toObject(), commentCount } });
    } catch (err) {
        console.error('Get post error:', err);
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// ─── LIKE / UNLIKE a post ───
router.post('/:id/like', clerkAuth, async (req, res) => {
    try {
        const userId = req.auth.sub;
        const { displayName, avatarUrl } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const alreadyLiked = post.likedBy.includes(userId);

        if (alreadyLiked) {
            // Unlike
            post.likedBy = post.likedBy.filter(id => id !== userId);
            post.likes = Math.max(0, post.likes - 1);
            await post.save();
            return res.json({ liked: false, likes: post.likes });
        }

        // Like
        post.likedBy.push(userId);
        post.likes += 1;
        await post.save();

        // Create notification for post owner (don't notify yourself)
        if (post.userId !== userId) {
            await Notification.create({
                userId: post.userId,
                type: 'like',
                fromUserId: userId,
                fromDisplayName: displayName || '',
                fromAvatarUrl: avatarUrl || '',
                postId: post._id,
            });
        }

        res.json({ liked: true, likes: post.likes });
    } catch (err) {
        console.error('Like error:', err);
        res.status(500).json({ error: 'Failed to like post' });
    }
});

// ─── GET comments for a post ───
router.get('/:id/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.id })
            .sort({ createdAt: -1 })
            .limit(100);
        res.json({ comments });
    } catch (err) {
        console.error('Get comments error:', err);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// ─── POST a comment ───
router.post('/:id/comments', clerkAuth, async (req, res) => {
    try {
        const userId = req.auth.sub;
        const { text, displayName, avatarUrl } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Comment text is required' });
        }

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const comment = await Comment.create({
            postId: post._id,
            userId,
            text: text.trim().slice(0, 500),
            displayName: displayName || '',
            avatarUrl: avatarUrl || '',
        });

        // Create notification for post owner (don't notify yourself)
        if (post.userId !== userId) {
            await Notification.create({
                userId: post.userId,
                type: 'comment',
                fromUserId: userId,
                fromDisplayName: displayName || '',
                fromAvatarUrl: avatarUrl || '',
                postId: post._id,
                commentId: comment._id,
                commentText: text.trim().slice(0, 100),
            });
        }

        res.status(201).json({ comment });
    } catch (err) {
        console.error('Comment error:', err);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// ─── DELETE a comment (only by author) ───
router.delete('/:postId/comments/:commentId', clerkAuth, async (req, res) => {
    try {
        const userId = req.auth.sub;
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        if (comment.userId !== userId) return res.status(403).json({ error: 'Not your comment' });

        await comment.deleteOne();
        res.json({ deleted: true });
    } catch (err) {
        console.error('Delete comment error:', err);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

// ─── DELETE a post (only by author) ───
router.delete('/:id', clerkAuth, async (req, res) => {
    try {
        const userId = req.auth.sub;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        if (post.userId !== userId) return res.status(403).json({ error: 'Not your post' });

        // Delete associated comments and notifications
        await Comment.deleteMany({ postId: post._id });
        await Notification.deleteMany({ postId: post._id });

        // Delete from Cloudinary if it's a Cloudinary URL
        if (post.contentUrl && post.contentUrl.includes('cloudinary.com')) {
            try {
                const { v2: cloudinary } = require('cloudinary');
                // Extract public_id from URL
                const urlParts = post.contentUrl.split('/');
                const folderAndFile = urlParts.slice(-2).join('/');
                const publicId = folderAndFile.replace(/\.[^.]+$/, '');
                await cloudinary.uploader.destroy(publicId, {
                    resource_type: post.mediaType === 'video' ? 'video' : 'image',
                });
            } catch (cloudErr) {
                console.error('Cloudinary delete failed (non-fatal):', cloudErr.message);
            }
        }

        await post.deleteOne();
        res.json({ deleted: true });
    } catch (err) {
        console.error('Delete post error:', err);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

module.exports = router;
