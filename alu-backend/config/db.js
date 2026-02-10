const mongoose = require('mongoose');

// User Schema - Tracks credits
const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  dailyImages: { type: Number, default: 0 },
  dailyShorts: { type: Number, default: 0 },
  dailyLongVids: { type: Number, default: 0 },
  lastResetDate: { type: Date, default: Date.now },
  isPro: { type: Boolean, default: false },
  subscriptionId: { type: String },
  stripeCustomerId: { type: String }
});

// Post Schema - Tracks content
const PostSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  contentUrl: { type: String, required: true },
  safePrompt: { type: String, default: '' },
  originalPrompt: { type: String },
  caption: { type: String, default: '' },
  is_ai: { type: Boolean, default: true },
  mediaType: { type: String, enum: ['image', 'video'], required: true },
  videoType: { type: String, enum: ['short', 'long'] },
  timestamp: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  isLongForm: { type: Boolean, default: false },
  thumbnailUrl: { type: String },
  visibility: { type: String, enum: ['everyone', 'followers', 'private'], default: 'everyone' },
  status: { type: String, enum: ['ready', 'pending', 'failed'], default: 'ready' }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Post = mongoose.model('Post', PostSchema);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected (Alu Database)');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

module.exports = { connectDB, User, Post };
