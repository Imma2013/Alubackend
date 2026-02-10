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
  safePrompt: { type: String, required: true },
  originalPrompt: { type: String },
  is_ai: { type: Boolean, default: true },
  mediaType: { type: String, enum: ['image', 'video'], required: true }, // mapped from user input 'type'
  videoType: { type: String, enum: ['short', 'long'] }, // extra detail if video
  timestamp: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  isLongForm: { type: Boolean, default: false },
  thumbnailUrl: { type: String }
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
