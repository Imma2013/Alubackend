const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const clerkAuth = require('../middleware/clerkAuth');
const { Post } = require('../config/db');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer: store in memory (buffer), 100MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

/**
 * POST /upload
 * Accepts multipart/form-data with:
 *   - file: the image or video file
 *   - mediaType: 'image' | 'video'
 *   - caption: optional text caption
 *   - videoType: 'short' | 'long' (optional, for videos)
 */
router.post('/', clerkAuth, upload.single('file'), async (req, res) => {
  const userId = req.auth.sub;
  const { caption, mediaType, videoType } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (!mediaType || !['image', 'video'].includes(mediaType)) {
    return res.status(400).json({ error: 'mediaType must be "image" or "video"' });
  }

  try {
    // Upload to Cloudinary via stream
    const cloudResult = await new Promise((resolve, reject) => {
      const resourceType = mediaType === 'image' ? 'image' : 'video';
      const options = {
        resource_type: resourceType,
        folder: 'alu-uploads',
        public_id: `${userId}_${Date.now()}`,
      };

      // For videos, generate a thumbnail via eager transform
      if (resourceType === 'video') {
        options.eager = [
          { format: 'jpg', width: 400, height: 400, crop: 'thumb', gravity: 'auto' },
        ];
        options.eager_async = false;
      }

      const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });

      uploadStream.end(req.file.buffer);
    });

    // Create Post in MongoDB
    const post = await Post.create({
      userId,
      contentUrl: cloudResult.secure_url,
      safePrompt: caption || 'User upload',
      originalPrompt: caption || '',
      is_ai: false,
      mediaType,
      videoType: mediaType === 'video' ? (videoType || 'short') : undefined,
      isLongForm: videoType === 'long',
      thumbnailUrl: cloudResult.eager?.[0]?.secure_url || null,
    });

    res.status(201).json({ success: true, post });
  } catch (error) {
    console.error('Upload Error:', error);
    if (error.message?.includes('File too large')) {
      return res.status(413).json({ error: 'File too large. Maximum size is 100MB.' });
    }
    res.status(500).json({ error: 'Upload failed. Please try again.' });
  }
});

module.exports = router;
