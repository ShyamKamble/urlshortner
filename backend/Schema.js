import mongoose from 'mongoose';
import { configDotenv } from 'dotenv';
configDotenv();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

const userschema = new mongoose.Schema({
  id: {
    type: Number,
    default: () => Date.now() + Math.floor(Math.random() * 100),
    unique: true
  },
  first_name: String,
  last_name: String,
  email: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values for anonymous users
  },
  password: String,
  urls: [
    {
      originalUrl: {
        type: String,
        required: true
      },
      shortCode: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 10
      },
      compeleturl: String,
      createdAt: {
        type: Date,
        default: Date.now
      },
      clickCount: {
        type: Number,
        default: 0
      },
      lastAccessed: {
        type: Date,
        default: null
      }
    }
  ]
}, {
  timestamps: true // Adds createdAt and updatedAt to user document
});

// Indexes for performance and uniqueness
userschema.index({ email: 1 }, { unique: true, sparse: true });
userschema.index({ id: 1 }, { unique: true });

// Critical: Ensure shortCode uniqueness across ALL users and URLs
// This creates a unique index on the shortCode field within the urls array
userschema.index({ "urls.shortCode": 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { "urls.shortCode": { $exists: true, $ne: null } }
});

// Performance indexes
userschema.index({ "urls.createdAt": -1 }); // For sorting URLs by creation date
userschema.index({ "urls.lastAccessed": -1 }); // For analytics queries

// Pre-save middleware to validate shortCode uniqueness
userschema.pre('save', function() {
  if (this.isModified('urls')) {
    // Check for duplicate shortCodes within this user's URLs
    const shortCodes = this.urls.map(url => url.shortCode).filter(Boolean);
    const uniqueShortCodes = [...new Set(shortCodes)];
    
    if (shortCodes.length !== uniqueShortCodes.length) {
      const error = new Error('Duplicate short codes found within user URLs');
      error.name = 'ValidationError';
      throw error;
    }
  }
});

// Static method to find URL by shortCode across all users
userschema.statics.findByShortCode = async function(shortCode) {
  try {
    const user = await this.findOne({
      "urls.shortCode": shortCode
    });
    
    if (!user) return null;
    
    const urlObj = user.urls.find(url => url.shortCode === shortCode);
    return {
      user,
      url: urlObj
    };
  } catch (error) {
    console.error('Error finding URL by shortCode:', error);
    throw error;
  }
};

// Static method to check if shortCode exists
userschema.statics.shortCodeExists = async function(shortCode) {
  try {
    const count = await this.countDocuments({
      "urls.shortCode": shortCode
    });
    return count > 0;
  } catch (error) {
    console.error('Error checking shortCode existence:', error);
    return false; // Assume it doesn't exist if we can't check
  }
};

const User = mongoose.model("User", userschema);

export { User, userschema, MONGODB_URI };