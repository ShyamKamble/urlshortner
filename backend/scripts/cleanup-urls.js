// Script to clean up corrupted URLs in the database
import mongoose from 'mongoose';
import { User, MONGODB_URI } from '../Schema.js';
import { configDotenv } from 'dotenv';

configDotenv();

async function cleanupUrls() {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to database');
    
    console.log('🔍 Finding users with URLs...');
    const users = await User.find({ 'urls.0': { $exists: true } });
    console.log(`📊 Found ${users.length} users with URLs`);
    
    let totalFixed = 0;
    
    for (const user of users) {
      let userFixed = 0;
      
      for (const url of user.urls) {
        let originalUrl = url.originalUrl;
        const originalOriginalUrl = originalUrl;
        
        if (typeof originalUrl === 'string') {
          // Clean up HTML entities
          originalUrl = originalUrl
            .replace(/&#x2F;/g, '/')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'");
          
          // Fix double protocol issue
          if (originalUrl.startsWith('https://https://') || originalUrl.startsWith('http://https://')) {
            originalUrl = originalUrl.replace(/^https?:\/\//, '');
          }
          if (originalUrl.startsWith('https://http://') || originalUrl.startsWith('http://http://')) {
            originalUrl = originalUrl.replace(/^https?:\/\//, '');
          }
          
          // Update if changed
          if (originalUrl !== originalOriginalUrl) {
            console.log(`🔧 Fixing URL for user ${user.email}:`);
            console.log(`   Before: ${originalOriginalUrl}`);
            console.log(`   After:  ${originalUrl}`);
            
            url.originalUrl = originalUrl;
            userFixed++;
            totalFixed++;
          }
        }
      }
      
      if (userFixed > 0) {
        await user.save();
        console.log(`✅ Fixed ${userFixed} URLs for user ${user.email}`);
      }
    }
    
    console.log(`\n🎉 Cleanup complete! Fixed ${totalFixed} URLs total.`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

cleanupUrls();