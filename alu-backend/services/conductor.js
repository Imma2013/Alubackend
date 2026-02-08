const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');
const { PostHog } = require('posthog-node');
const { User, Post } = require('../config/db');

// Initialize PostHog
const posthog = new PostHog(process.env.POSTHOG_API_KEY, {
  host: process.env.POSTHOG_HOST || 'https://us.i.posthog.com'
});

// Initialize Gemini for Prompt Cleaning
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
    console.error("⚠️ Prompt cleaning failed, using original:", error.message);
    return prompt;
  }
}

/**
 * Main Conductor Function
 */
async function generateContent(userId, prompt, type, isLongVideo = false) {
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
  console.log(`🧼 Cleaned Prompt: "${safePrompt}"`);

  let contentUrl;
  let modelName;
  let provider;

  try {
    if (type === 'image') {
      // --- IMAGE: Nano Banana (Google) ---
      modelName = 'gemini-2.5-flash-image';
      provider = 'Google Gemini (Nano Banana)';
      console.log(`🎨 Dispatching to ${provider}...`);

      const imageResponse = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: safePrompt }] }],
      });
      // Assuming the response for an image model contains a URL or data to construct one
      // This part is highly dependent on the actual API response structure for image generation
      contentUrl = imageResponse.url || imageResponse.data?.url;
      if(!contentUrl) throw new Error("Image generation did not return a URL.");

    } else if (type === 'video' && !isLongVideo) {
      // --- SHORT VIDEO: Veo 3.1 (Google) ---
      modelName = 'veo-3.1-generate-preview';
      provider = 'Google Gemini (Veo 3.1)';
      console.log(`🎥 Dispatching to ${provider}...`);

      const videoResponse = await ai.models.generateVideos({
        model: modelName,
        prompt: safePrompt,
        config: { aspect_ratio: "9:16", duration: "8s" }
      });
      // The SDK likely returns an operation to poll or a direct URL upon completion
      contentUrl = videoResponse.url;
      if(!contentUrl) throw new Error("Video generation did not return a URL.");

    } else if (type === 'video' && isLongVideo) {
      // --- LONG VIDEO: Sora 2 (Third-Party) ---
      modelName = 'sora-2-pro-storyboard';
      provider = 'ThirdParty (Sora 2)';
      console.log(`🎬 Dispatching to ${provider}...`);

      const soraResponse = await axios.post(process.env.THIRD_PARTY_API_URL, {
        model: modelName,
        prompt: safePrompt
      }, {
        headers: { 'Authorization': `Bearer ${process.env.THIRD_PARTY_API_KEY}` }
      });

      contentUrl = soraResponse.data.url || soraResponse.data.output_url;
      if(!contentUrl) throw new Error("Sora generation did not return a URL.");
    }

    user[limitKey] += 1;
    await user.save();

    const newPost = await Post.create({
      userId, contentUrl, safePrompt, originalPrompt: prompt,
      is_ai: true, mediaType: type,
      videoType: type === 'video' ? (isLongVideo ? 'long' : 'short') : undefined,
      isLongForm: isLongVideo
    });

    posthog.capture({
      distinctId: userId,
      event: 'ai_content_generated',
      properties: { type, model: modelName, provider, isLongForm: isLongVideo }
    });

    return newPost;

  } catch (error) {
    console.error(`❌ Generation Error (${type}):`, error.response?.data || error.message);
    throw error;
  }
}

module.exports = { generateContent, cleanPrompt };