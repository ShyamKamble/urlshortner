import { nanoid } from 'nanoid';
import { User } from '../Schema.js';

/**
 * Generate a unique short code with collision detection and retry logic
 * @param {number} length - Length of the short code (default: 5)
 * @param {number} maxAttempts - Maximum retry attempts (default: 10)
 * @returns {Promise<string>} - Unique short code
 */
export const generateUniqueShortCode = async (length = 5, maxAttempts = 10) => {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    // Generate short code with increasing length on retries
    const currentLength = length + Math.floor(attempts / 3); // Increase length every 3 attempts
    const shortCode = nanoid(currentLength);
    
    try {
      // Check if short code already exists in database
      const existingUrl = await User.findOne({
        "urls.shortCode": shortCode
      });
      
      if (!existingUrl) {
        console.log(`✅ Generated unique short code: ${shortCode} (attempt ${attempts})`);
        return shortCode;
      }
      
      console.log(`⚠️ Collision detected for ${shortCode}, retrying... (attempt ${attempts})`);
      
    } catch (error) {
      console.error(`❌ Database error during collision check (attempt ${attempts}):`, error.message);
      
      // If database is down, still return a code but log the issue
      if (attempts === maxAttempts) {
        console.error('❌ Database unavailable, returning unverified short code');
        return shortCode;
      }
    }
  }
  
  // If all attempts failed, throw error
  throw new Error(`Failed to generate unique short code after ${maxAttempts} attempts`);
};

/**
 * Validate short code format
 * @param {string} shortCode - Short code to validate
 * @returns {boolean} - True if valid
 */
export const isValidShortCode = (shortCode) => {
  // Check length (5-10 characters)
  if (!shortCode || shortCode.length < 5 || shortCode.length > 10) {
    return false;
  }
  
  // Check characters (alphanumeric, hyphens, underscores only)
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  return validPattern.test(shortCode);
};

/**
 * Get collision statistics for monitoring
 * @returns {Promise<Object>} - Collision statistics
 */
export const getCollisionStats = async () => {
  try {
    const totalUrls = await User.aggregate([
      { $unwind: "$urls" },
      { $count: "total" }
    ]);
    
    const uniqueShortCodes = await User.aggregate([
      { $unwind: "$urls" },
      { $group: { _id: "$urls.shortCode" } },
      { $count: "unique" }
    ]);
    
    const total = totalUrls[0]?.total || 0;
    const unique = uniqueShortCodes[0]?.unique || 0;
    
    return {
      totalUrls: total,
      uniqueShortCodes: unique,
      collisionRate: total > 0 ? ((total - unique) / total * 100).toFixed(2) : 0,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error getting collision stats:', error);
    return {
      error: 'Unable to fetch collision statistics',
      timestamp: new Date().toISOString()
    };
  }
};