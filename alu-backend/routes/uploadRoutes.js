const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const clerkAuth = require('../middleware/clerkAuth');
const { Post, User } = require('../config/db');

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
 *   - file or files: single file or multiple image files (up to 5 for carousel)
 *   - mediaType: 'image' | 'video'
 *   - caption: optional text caption
 *   - videoType: 'short' | 'long' (optional, for videos)
 */
router.post('/', clerkAuth, upload.any(), async (req, res) => {
  const userId = req.auth.sub;
  const { caption, mediaType, videoType, visibility, displayName, avatarUrl, is_ai, quality } = req.body;

  // Support both single 'file' and multiple 'files'
  const files = req.files || [];

  if (files.length === 0) {
    return res.status(400).json({ error: 'No file(s) uploaded' });
  }

  if (!mediaType || !['image', 'video'].includes(mediaType)) {
    return res.status(400).json({ error: 'mediaType must be "image" or "video"' });
  }

  // Limit multi-image uploads to 5 images max
  if (files.length > 5 && mediaType === 'image') {
    return res.status(400).json({ error: 'Maximum 5 images allowed per post' });
  }

  try {
    // Sync user profile info to User record (makes them searchable)
    if (displayName) {
      await User.findOneAndUpdate(
        { userId },
        { $set: { displayName, avatarUrl: avatarUrl || '' } },
        { upsert: true }
      );
    }

    // Upload all files to Cloudinary
    const uploadPromises = files.map((file, index) => {
      return new Promise((resolve, reject) => {
        const resourceType = mediaType === 'image' ? 'image' : 'video';
        const options = {
          resource_type: resourceType,
          folder: 'alu-uploads',
          public_id: `${userId}_${Date.now()}_${index}`,
        };

        // For videos, apply quality and generate thumbnail
        if (resourceType === 'video') {
          const qualityMap = {
            '360p': 360,
            '720p': 720,
            '1080p': 1080,
            '4k': 2160
          };
          const height = qualityMap[quality] || 360;

          options.eager = [
            { format: 'jpg', width: 400, height: 400, crop: 'thumb', gravity: 'auto' },
            { format: 'mp4', height, quality: 'auto', crop: 'limit' }
          ];
          options.eager_async = false;
        }

        const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });

        uploadStream.end(file.buffer);
      });
    });

    const cloudResults = await Promise.all(uploadPromises);
    const imageUrls = cloudResults.map(result => result.secure_url);

    // Create Post in MongoDB
    const post = await Post.create({
      userId,
      contentUrl: imageUrls[0], // First image/video as primary
      images: imageUrls.length > 1 ? imageUrls : undefined, // Store all URLs if multiple
      caption: caption || '',
      safePrompt: caption || 'User upload',
      originalPrompt: caption || '',
      is_ai: is_ai === 'true' || is_ai === true,
      mediaType,
      videoType: mediaType === 'video' ? (videoType || 'short') : undefined,
      isLongForm: videoType === 'long',
      thumbnailUrl: cloudResults[0].eager?.[0]?.secure_url || null,
      visibility: visibility || 'everyone',
      displayName: displayName || '',
      avatarUrl: avatarUrl || '',
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
