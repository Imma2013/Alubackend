const express = require('express');
const router = express.Router();
const { Notification } = require('../config/db');
const clerkAuth = require('../middleware/clerkAuth');

// ─── GET notifications for the current user (grouped) ───
router.get('/', clerkAuth, async (req, res) => {
    try {
        const userId = req.auth.sub;
        const rawNotifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(100);

        // Group notifications by (postId + type)
        const grouped = {};
        rawNotifications.forEach(notif => {
            // For follow notifications, group by type only (no postId)
            const key = notif.type === 'follow'
                ? `follow_${notif.fromUserId}`
                : `${notif.postId}_${notif.type}`;

            if (!grouped[key]) {
                grouped[key] = {
                    type: notif.type,
                    postId: notif.postId || null,
                    commentId: notif.commentId || null,
                    parentCommentId: notif.parentCommentId || null,
                    commentText: notif.commentText || '',
                    users: [],
                    count: 0,
                    latestTimestamp: notif.createdAt,
                    read: notif.read,
                };
            }

            grouped[key].users.push({
                userId: notif.fromUserId,
                displayName: notif.fromDisplayName,
                avatarUrl: notif.fromAvatarUrl,
            });
            grouped[key].count = grouped[key].users.length;

            // Update read status (if any notification is unread, group is unread)
            if (!notif.read) {
                grouped[key].read = false;
            }
        });

        // Convert to array and sort by latest timestamp
        const groupedNotifications = Object.values(grouped).sort((a, b) =>
            new Date(b.latestTimestamp) - new Date(a.latestTimestamp)
        );

        const unreadCount = await Notification.countDocuments({ userId, read: false });

        res.json({ notifications: groupedNotifications, unreadCount });
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
