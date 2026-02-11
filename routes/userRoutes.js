const express = require('express');
const clerkAuth = require('../middleware/clerkAuth');
const { User, Post } = require('../config/db');

const router = express.Router();

/**
 * GET /users/search?q=name
 * Search users by displayName (case-insensitive regex)
 */
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 1) {
            return res.json({ users: [] });
        }

        // Escape regex special chars for safety
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const users = await User.find(
            { displayName: { $regex: escaped, $options: 'i' } },
            { userId: 1, displayName: 1, avatarUrl: 1, bio: 1, _id: 0 }
        ).limit(20);

        res.json({ users });
    } catch (error) {
        console.error('User search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

/**
 * GET /users/:userId
 * Get a user's public profile (display info + post counts)
 */
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findOne(
            { userId },
            { userId: 1, displayName: 1, avatarUrl: 1, bio: 1, isPro: 1, _id: 0 }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Count their public posts
        const [posts, shorts, videos] = await Promise.all([
            Post.countDocuments({ userId, mediaType: 'image', visibility: 'everyone' }),
            Post.countDocuments({ userId, mediaType: 'video', videoType: 'short', visibility: 'everyone' }),
            Post.countDocuments({ userId, mediaType: 'video', videoType: 'long', visibility: 'everyone' }),
        ]);

        res.json({
            userId: user.userId,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
            isPro: user.isPro,
            counts: { posts, shorts, videos },
        });
    } catch (error) {
        console.error('User profile error:', error);
        res.status(500).json({ error: 'Failed to load profile' });
    }
});

module.exports = router;
