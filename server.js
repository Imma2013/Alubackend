const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB, Post, User } = require('./config/db');
const initCreditGuard = require('./utils/creditGuard');
const { generateContent } = require('./services/conductor');
const { createJob, getJob } = require('./services/videoJobs');
const { processVideoJob } = require('./services/videoStitcher');
const paymentRoutes = require('./routes/paymentRoutes');
const syncRoutes = require('./routes/syncRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const clerkAuth = require('./middleware/clerkAuth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use((req, res, next) => {
  if (req.originalUrl === '/payments/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Simple rate limiter for uploads (10 req/min per IP)
const uploadRateLimit = new Map();
const rateLimitUpload = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 60000;
  const maxRequests = 10;
  const requests = (uploadRateLimit.get(ip) || []).filter(t => now - t < windowMs);
  if (requests.length >= maxRequests) {
    return res.status(429).json({ error: 'Too many uploads. Please try again later.' });
  }
  requests.push(now);
  uploadRateLimit.set(ip, requests);
  next();
};

// Routes
app.use('/payments', paymentRoutes);
app.use('/sync', syncRoutes);
app.use('/upload', rateLimitUpload, uploadRoutes);

// This route is now protected. A valid Clerk token is required.
app.post('/generate', clerkAuth, async (req, res) => {
  const userId = req.auth.sub;
  const { prompt, type, isLongVideo, visibility } = req.body;

  if (!prompt || !type) {
    return res.status(400).json({ error: 'Missing required fields: prompt or type' });
  }

  try {
    const post = await generateContent(userId, prompt, type, isLongVideo, visibility || 'everyone');
    res.status(201).json({ success: true, post });
  } catch (error) {
    if (error.message.includes('429')) {
      return res.status(429).json({ error: error.message });
    }
    console.error('Server Generation Error:', error);
    res.status(500).json({ error: 'Internal Server Error during generation' });
  }
});

// Usage endpoint — returns real daily counts
app.get('/usage', clerkAuth, async (req, res) => {
  try {
    const userId = req.auth.sub;
    let user = await User.findOne({ userId });
    if (!user) {
      user = await User.create({ userId });
    }
    res.json({
      dailyImages: user.dailyImages || 0,
      dailyShorts: user.dailyShorts || 0,
      dailyLongVids: user.dailyLongVids || 0,
      limits: { image: 3, short: 2, long: 1 },
      isPro: user.isPro || false,
    });
  } catch (error) {
    console.error('Usage Error:', error);
    res.status(500).json({ error: 'Failed to fetch usage' });
  }
});

// This route remains public for now
app.get('/feed', async (req, res) => {
  try {
    const { type, media } = req.query;
    let filter = { visibility: 'everyone' };

    if (type === 'ai') filter.is_ai = true;
    if (type === 'human') filter.is_ai = false;

    if (media === 'image') filter.mediaType = 'image';
    if (media === 'video') filter.mediaType = 'video';

    const posts = await Post.find(filter).sort({ timestamp: -1 }).limit(50);
    res.json(posts);
  } catch (error) {
    console.error('Feed Error:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

app.get('/', (req, res) => {
  res.send('Alu API is running with Conductor & CreditGuard');
});

// --- Long Video Stitching ---
app.post('/generate/long-video', clerkAuth, async (req, res) => {
  try {
    const userId = req.auth.sub;
    const { prompt, durationSeconds, visibility } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    const duration = Math.min(Math.max(durationSeconds || 300, 30), 600); // 30s - 10min

    // Check daily limit
    let user = await User.findOne({ userId });
    if (!user) user = await User.create({ userId });
    if (user.dailyLongVids >= 1 && !user.isPro) {
      return res.status(429).json({ error: 'Daily long video limit reached. Upgrade to Pro for more.' });
    }

    // Create job
    const job = createJob(userId, prompt, duration, visibility || 'everyone');

    // Start processing in background (fire and forget)
    processVideoJob(job).catch(err => {
      console.error(`Background video job ${job.jobId} error:`, err);
    });

    res.status(202).json({ jobId: job.jobId, status: 'queued' });
  } catch (error) {
    console.error('Long Video Error:', error);
    res.status(500).json({ error: 'Failed to start video generation' });
  }
});

app.get('/generate/status/:jobId', clerkAuth, async (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Security: only the job owner can check status
  if (job.userId !== req.auth.sub) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json({
    jobId: job.jobId,
    status: job.status,
    progress: job.progress,
    totalClips: job.totalClips,
    completedClips: job.completedClips,
    currentStep: job.currentStep,
    videoUrl: job.videoUrl,
    thumbnailUrl: job.thumbnailUrl,
    error: job.error,
    postId: job.postId || null,
  });
});

const startServer = async () => {
  try {
    await connectDB();
    initCreditGuard();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();