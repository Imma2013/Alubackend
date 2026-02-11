const express = require('express');
const router = express.Router();
const { Notification } = require('../config/db');
const clerkAuth = require('../middleware/clerkAuth');

// ─── GET notifications for the current user ───
router.get('/', clerkAuth, async (req, res) => {
    try {
        const userId = req.auth.sub;
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({ userId, read: false });

        res.json({ notifications, unreadCount });
    } catch (err) {
        console.error('Get notifications error:', err);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// ─── Mark all notifications as read ───
router.post('/read', clerkAuth, async (req, res) => {
    try {
        const userId = req.auth.sub;
        await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
        res.json({ success: true });
    } catch (err) {
        console.error('Mark read error:', err);
        res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
});

// ─── GET unread count only (for badge) ───
router.get('/unread-count', clerkAuth, async (req, res) => {
    try {
        const userId = req.auth.sub;
        const count = await Notification.countDocuments({ userId, read: false });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get count' });
    }
});

module.exports = router;
