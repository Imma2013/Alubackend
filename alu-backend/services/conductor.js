const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');
const { PostHog } = require('posthog-node');
const { v2: cloudinary } = require('cloudinary');
const { User, Post } = require('../config/db');

// Initialize PostHog
const posthog = new PostHog(process.env.POSTHOG_API_KEY, {
  host: process.env.POSTHOG_HOST || 'https://us.i.posthog.com'
});

// Initialize Google GenAI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Configure Cloudinary (shared with uploadRoutes)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Daily Limits
const LIMITS = {
  image: 3,
  short: 2,
  long: 1
};

/**
 * Clean the prompt using Gemini 2.0 Flash to remove brands/celebrities.
 */
async function cleanPrompt(prompt) {
  try {
    const instruction = "Rewrite the following prompt to be safe for AI generation. Remove any celebrity names, specific brand names, or copyrighted characters. Replace them with generic descriptions. Keep the artistic style and core intent. Return ONLY the cleaned prompt text.";

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `${instruction}\n\nPrompt: ${prompt}`
    });

    return response.text.trim();
  } catch (error) {
    console.error("Prompt cleaning failed, using original:", error.message);
    return prompt;
  }
}

/**
 * Upload a base64 image buffer to Cloudinary and return the URL
 */
async function uploadBase64ToCloudinary(base64Data, userId) {
  return new Promise((resolve, reject) => {
    const dataUri = `data:image/png;base64,${base64Data}`;
    cloudinary.uploader.upload(dataUri, {
      resource_type: 'image',
      folder: 'alu-ai-gen',
      public_id: `${userId}_${Date.now()}`,
    }, (error, result) => {
      if (error) reject(error);
      else resolve(result.secure_url);
    });
  });
}

/**
 * Upload a video buffer/URL to Cloudinary and return the URL
 */
async function uploadVideoToCloudinary(videoUrl, userId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(videoUrl, {
      resource_type: 'video',
      folder: 'alu-ai-gen',
      public_id: `${userId}_${Date.now()}`,
      eager: [
        { format: 'jpg', width: 400, height: 400, crop: 'thumb', gravity: 'auto' },
      ],
      eager_async: false,
    }, (error, result) => {
      if (error) reject(error);
      else resolve({
        videoUrl: result.secure_url,
        thumbnailUrl: result.eager?.[0]?.secure_url || null,
      });
    });
  });
}

/**
 * Main Conductor Function
 */
async function generateContent(userId, prompt, type, isLongVideo = false, visibility = 'everyone') {
  let user = await User.findOne({ userId });
  if (!user) {
    user = await User.create({ userId });
  }

  let limitKey = 'dailyImages';
  if (type === 'video') {
    limitKey = isLongVideo ? 'dailyLongVids' : 'dailyShorts';
  }

  if (user[limitKey] >= LIMITS[limitKey === 'dailyLongVids' ? 'long' : (limitKey === 'dailyShorts' ? 'short' : 'image')]) {
    throw new Error('429: Daily limit reached for this content type.');
  }

  const safePrompt = await cleanPrompt(prompt);
  console.log(`Cleaned Prompt: "${safePrompt}"`);

  let contentUrl;
  let thumbnailUrl = null;
  let modelName;
  let provider;

  try {
    if (type === 'image') {
      // --- IMAGE: NanoBanana Pro (Gemini 3 Pro Image) ---
      modelName = 'gemini-3-pro-image-preview';
      provider = 'NanoBanana Pro';
      console.log(`Dispatching to ${provider}...`);

      const imageResponse = await ai.models.generateContent({
        model: modelName,
        contents: safePrompt,
        config: {
          responseModalities: ['IMAGE'],
        },
      });

      // Extract image from response parts
      const parts = imageResponse.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'));

      if (!imagePart) {
        throw new Error('NanoBanana Pro returned no image data.');
      }

      const base64Image = imagePart.inlineData.data;

      // Upload base64 to Cloudinary to get a URL
      contentUrl = await uploadBase64ToCloudinary(base64Image, userId);
      console.log(`Image uploaded to Cloudinary: ${contentUrl}`);

    } else if (type === 'video' && !isLongVideo) {
      // --- SHORT VIDEO: Google Veo 3.1 ---
      modelName = 'veo-3.1-generate-preview';
      provider = 'Google Veo 3.1';
      console.log(`Dispatching to ${provider}...`);

      const operation = await ai.models.generateVideos({
        model: modelName,
        prompt: safePrompt,
        config: {
          aspectRatio: "9:16",
          durationSeconds: 8,
        }
      });

      // Poll for completion
      let result = operation;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max (5s intervals)

      while (!result.done && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        result = await ai.operations.get({ operation: result });
        attempts++;
        console.log(`Video gen poll attempt ${attempts}/${maxAttempts}...`);
      }

      if (!result.done) {
        throw new Error("Video generation timed out after 5 minutes.");
      }

      if (!result.response?.generatedVideos || result.response.generatedVideos.length === 0) {
        throw new Error("Video generation returned no videos.");
      }

      const videoData = result.response.generatedVideos[0].video;

      // Upload video to Cloudinary
      let videoSource;
      if (videoData.uri) {
        videoSource = videoData.uri;
      } else if (videoData.videoBytes) {
        // Convert base64 to data URI for upload
        videoSource = `data:video/mp4;base64,${videoData.videoBytes}`;
      } else {
        throw new Error("Video generation returned no usable video data.");
      }

      const cloudResult = await uploadVideoToCloudinary(videoSource, userId);
      contentUrl = cloudResult.videoUrl;
      thumbnailUrl = cloudResult.thumbnailUrl;
      console.log(`Video uploaded to Cloudinary: ${contentUrl}`);

    } else if (type === 'video' && isLongVideo) {
      // --- LONG VIDEO: Not available via simple generation ---
      // Long videos use the stitching pipeline (Phase 3)
      throw new Error('Long video generation uses the video stitching pipeline. Use POST /generate/long-video instead.');
    }

    user[limitKey] += 1;
    await user.save();

    const newPost = await Post.create({
      userId, contentUrl, safePrompt, originalPrompt: prompt,
      is_ai: true, mediaType: type,
      videoType: type === 'video' ? (isLongVideo ? 'long' : 'short') : undefined,
      isLongForm: isLongVideo,
      visibility: visibility || 'everyone',
      thumbnailUrl,
    });

    posthog.capture({
      distinctId: userId,
      event: 'ai_content_generated',
      properties: { type, model: modelName, provider, isLongForm: isLongVideo }
    });

    return newPost;

  } catch (error) {
    console.error(`Generation Error (${type}):`, error.response?.data || error.message);
    throw error;
  }
}

module.exports = { generateContent, cleanPrompt };