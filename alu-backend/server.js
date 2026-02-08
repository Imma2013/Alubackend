const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB, Post } = require('./config/db');
const initCreditGuard = require('./utils/creditGuard');
const { generateContent } = require('./services/conductor');
const paymentRoutes = require('./routes/paymentRoutes');
const syncRoutes = require('./routes/syncRoutes');
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

// Routes
app.use('/payments', paymentRoutes);
app.use('/sync', syncRoutes);

// This route is now protected. A valid Clerk token is required.
app.post('/generate', clerkAuth, async (req, res) => {
  const userId = req.auth.sub; // Get user ID from verified token
  const { prompt, type, isLongVideo } = req.body;

  if (!prompt || !type) {
    return res.status(400).json({ error: 'Missing required fields: prompt or type' });
  }

  try {
    const post = await generateContent(userId, prompt, type, isLongVideo);
    res.status(201).json({ success: true, post });
  } catch (error) {
    if (error.message.includes('429')) {
      return res.status(429).json({ error: error.message });
    }
    console.error('Server Generation Error:', error);
    res.status(500).json({ error: 'Internal Server Error during generation' });
  }
});

// This route remains public for now
app.get('/feed', async (req, res) => {
  try {
    const { type, media } = req.query;
    let filter = {};

    if (type === 'ai') filter.is_ai = true;
    if (type === 'human') filter.is_ai = false;
    
    if (media === 'image') filter.mediaType = 'image';
    if (media === 'video') filter.mediaType = 'video';

    const posts = await Post.find(filter).sort({ timestamp: -1 }).limit(50);
    res.json(posts);
  } catch (error)
 {
    console.error('Feed Error:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

app.get('/', (req, res) => {
  res.send('Alu API is running with Conductor & CreditGuard 🛡️');
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