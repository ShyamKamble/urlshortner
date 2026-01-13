import express from 'express';
import { User } from '../Schema.js';
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  authenticateToken, 
  optionalAuth 
} from '../utils/auth.js';
import { 
  validateSignup, 
  validateLogin, 
  validateUrlShorten, 
  validateUserId, 
  validateShortCode 
} from '../utils/validation.js';
import { generateUniqueShortCode, getCollisionStats } from '../utils/shortCodeGenerator.js';
import FallbackStorage from '../utils/fallbackStorage.js';
import mongoose from 'mongoose';

const router = express.Router();
const fallbackStorage = new FallbackStorage();

// Helper function to check if database is available
const isDatabaseAvailable = () => {
  return mongoose.connection.readyState === 1;
};

// Authentication routes
router.post('/signup', validateSignup, async (req, res) => {
  try {
    console.log('📝 Signup request received:', req.body);
    
    const { first_name, last_name, email, password } = req.body;

    // Hash password
    const hashedPassword = await hashPassword(password);

    let user;
    
    if (isDatabaseAvailable()) {
      // Use MongoDB
      console.log('🔄 Using MongoDB for signup');
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('❌ User already exists:', email);
        return res.status(409).json({ error: 'User already exists with this email' });
      }

      user = await User.create({
        first_name,
        last_name,
        email,
        password: hashedPassword,
        urls: []
      });
    } else {
      // Use fallback storage
      console.log('⚠️ Using fallback storage (database unavailable)');
      user = await fallbackStorage.createUser({
        first_name,
        last_name,
        email,
        password: hashedPassword
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    console.log("✅ New user created:", user.email);
    res.status(201).json({ 
      success: true, 
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      },
      storage: isDatabaseAvailable() ? 'database' : 'fallback'
    });
  } catch (error) {
    console.error("❌ Signup error:", error);
    console.error("❌ Error stack:", error.stack);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    
    // Return more detailed error in development
    const errorResponse = {
      error: 'Server error during signup',
      ...(process.env.NODE_ENV === 'development' && {
        details: error.message,
        stack: error.stack
      })
    };
    
    res.status(500).json(errorResponse);
  }
});

router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    let user;
    
    if (isDatabaseAvailable()) {
      // Use MongoDB
      user = await User.findOne({ email });
    } else {
      // Use fallback storage
      console.log('⚠️ Using fallback storage (database unavailable)');
      user = await fallbackStorage.findUserByEmail(email);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    console.log("✅ User logged in:", user.email);
    res.json({ 
      success: true, 
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      },
      storage: isDatabaseAvailable() ? 'database' : 'fallback'
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Enhanced health check endpoint
router.get('/health', async (req, res) => {
  const dbManager = req.app.locals.dbManager;
  const dbHealth = dbManager ? await dbManager.healthCheck() : { status: 'unavailable' };
  
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: dbHealth,
    storage: isDatabaseAvailable() ? 'database' : 'fallback',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  });
});

// Database-specific health check
router.get('/health/database', async (req, res) => {
  const dbManager = req.app.locals.dbManager;
  const dbHealth = await dbManager.healthCheck();
  res.json(dbHealth);
});

// Collision statistics endpoint
router.get('/stats/collisions', async (req, res) => {
  try {
    const stats = await getCollisionStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: 'Unable to fetch collision statistics',
      message: error.message
    });
  }
});

// Simple test endpoint for frontend connection
router.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend connected successfully!', 
    timestamp: new Date().toISOString(),
    routes: 'working'
  });
});

// router.post('/adduser', (req, res) => {
//   const newuser = req.body
//   const extuser = data.find(user => user.id === newuser.id);

//   if (extuser && newuser.id === extuser.id) {
//     console.log("this id already exsist enter a diff id")
//     res.send("this id already exsist enter a diff id")
//   } else {
//     data.push(newuser);
//     fs.writeFileSync('MOCK_DATA.json', JSON.stringify(data, null, 2));
//     console.log("new user added")
//     res.json({ success: true, message: "User added successfully" });
//   }
// })

// router.get('/', async (req, res) => {
//   result = res.json(data);
//   console.log(result);
//   res.send(result);
// });

router.delete('/deleteusersfromdb/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deleteduser = await User.find({ id: id });
    await User.deleteOne({ id: id })
    console.log("this is the deleted user" + deleteduser)
    if (!deleteduser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("user with id " + id + " is deleted");
    res.json({ message: `User with id ${id} deleted` });
  }
  catch (error) {
    console.log(error)
  }
})

router.get('/searchuserbyname/:id', async (req, res) => {
  try {
    const name = req.params.id
    const user = await User.find({ name: name })
    if (!user) {
      res.send("user with this name is not present ")
    }
    res.json(user)
  }
  catch (error) {
    console.log(error)
    res.json(error)
  }
})

// Get user's URLs (protected route)
router.get('/user/:userId/urls', validateUserId, authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Ensure user can only access their own URLs
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Access denied: You can only access your own URLs' });
    }
    
    console.log('Fetching URLs for user ID:', userId);
    
    let user = null;
    
    if (isDatabaseAvailable()) {
      // Use MongoDB
      user = await User.findOne({ id: userId });
    } else {
      // Use fallback storage
      console.log('⚠️ Using fallback storage for user URLs');
      user = await fallbackStorage.findUserById(userId);
    }
    
    console.log('Found user:', user ? `${user.email} with ${user.urls?.length || 0} URLs` : 'No user found');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      success: true, 
      urls: user.urls || [],
      storage: isDatabaseAvailable() ? 'database' : 'fallback'
    });
  } catch (error) {
    console.error('❌ Error in /user/:userId/urls:', error);
    res.status(500).json({ error: 'Server error fetching URLs' });
  }
});

router.get('/allusersindb', async (req, res) => {
  try {
    const users = await User.find()
    res.json(users);
  }
  catch (error) {
    res.json(error)
  }
})

// router.get('/getallfemale', (req, res) => {
//   const females = data.filter(
//     user => user && user.password && user.password.length > 0
//   ).map(user => user.first_name)

//   res.json(females)
// })

// router.get('/getallmale', (req, res) => {
//   const males = data.filter(user => user && user.password && user.password.length > 5)
//     .map(user => user.first_name)
//   res.json(males)
//   const size = males.length
//   console.log(size)
//   res.send(males)
// })

// router.delete('/deleteuser/:id', (req, res) => {
//   const id = parseInt(req.params.id);
//   console.log(id)
//   const index = data.findIndex(user => user.id === id)
//   if (index !== -1) {
//     const deleteuser = data.splice(index, 1)[0];
//     console.log(deleteuser)
//     fs.writeFileSync("MOCK_DATA.json", JSON.stringify(data, null, 2))
//     console.log("this user is deleted")
//   } else {
//     res.status(404).json({ message: 'User not found' });

//   }
// }
// )

router.post('/submit', async (req, res) => {
  if (!req.body) {
    return res.status(400).send('No data received');
  }

  try {
    const user = await User.create(req.body);
    console.log("user added to db:", user);
    // Server-side redirect instead of JSON response
    return res.redirect('/home.html');
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
});

router.post("/shorten", validateUrlShorten, optionalAuth, async (req, res) => {
  try {
    console.log('📝 Shorten request received:', req.body);
    console.log('📝 Content-Type:', req.headers['content-type']);
    
    let { originalUrl } = req.body; // This is now processed by validation
    const userId = req.userId; // From JWT token if authenticated

    // Clean the URL before processing
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

    console.log('🔗 Shortening URL:', originalUrl);
    console.log('👤 User ID:', userId || 'anonymous');
    
    // Generate unique short code with enhanced collision handling
    let shortCode;
    try {
      shortCode = await generateUniqueShortCode(5, 10); // 5 chars, max 10 attempts
    } catch (error) {
      console.error('❌ Failed to generate unique short code:', error.message);
      return res.status(500).json({ 
        error: 'Unable to generate unique short code',
        message: 'Please try again. If the problem persists, contact support.'
      });
    }

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const shortUrl = `${baseUrl}/${shortCode}`;
    
    console.log('✅ Generated unique short code:', shortCode);

    const urlData = {
      originalUrl: originalUrl, // Now cleaned and properly processed
      shortCode: shortCode,
      compeleturl: shortUrl,
      createdAt: new Date(),
      clickCount: 0,
      lastAccessed: null
    };

    if (userId) {
      // If user is authenticated, add URL to their account
      const user = await User.findOne({ id: userId });
      if (user) {
        user.urls.push(urlData);
        
        try {
          await user.save();
          console.log("✅ URL added to user account:", user.email);
        } catch (saveError) {
          // Handle potential duplicate key error
          if (saveError.code === 11000) {
            console.error('❌ Duplicate short code detected during save:', shortCode);
            return res.status(409).json({
              error: 'Short code collision detected',
              message: 'Please try again to generate a new short code.'
            });
          }
          throw saveError;
        }
      } else {
        return res.status(404).json({ error: 'User not found' });
      }
    } else {
      // For anonymous users, create a user with a unique anonymous identifier
      const anonymousId = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        await User.create({
          first_name: 'Anonymous',
          last_name: 'User',
          email: anonymousId,
          password: null,
          urls: [urlData]
        });
        console.log("✅ Anonymous URL created");
      } catch (createError) {
        // Handle potential duplicate key error
        if (createError.code === 11000) {
          console.error('❌ Duplicate short code detected during create:', shortCode);
          return res.status(409).json({
            error: 'Short code collision detected',
            message: 'Please try again to generate a new short code.'
          });
        }
        throw createError;
      }
    }

    res.json({ 
      success: true,
      shortUrl: shortUrl,
      shortCode: shortCode,
      originalUrl: originalUrl,
      createdAt: urlData.createdAt
    });
  } catch (error) {
    console.error('❌ Error in /shorten:', error);
    res.status(500).json({ error: 'Server error while creating short URL' });
  }
});

// Clean up anonymous users with null emails (for fixing the duplicate key error)
router.delete('/cleanup-anonymous', async (req, res) => {
  try {
    const result = await User.deleteMany({ 
      $or: [
        { email: null },
        { email: { $regex: /^anonymous_/ } }
      ]
    });
    console.log(`Cleaned up ${result.deletedCount} anonymous users`);
    res.json({ 
      success: true, 
      message: `Cleaned up ${result.deletedCount} anonymous users` 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Server error during cleanup' });
  }
});

router.delete('/deleteall', async (req, res) => {
  try {
    const deletedusers = await User.deleteMany({})
    console.log("all the above users are deleted")
  } catch (error) {
    console.log(error)
  }
})

// Debug route to check a specific short code
router.get('/debug/check/:shortcode', async (req, res) => {
  try {
    const shortCode = req.params.shortcode;
    console.log('🔍 Debug check for short code:', shortCode);
    
    let result = null;
    
    if (isDatabaseAvailable()) {
      result = await User.findByShortCode(shortCode);
    } else {
      result = await fallbackStorage.findByShortCode(shortCode);
    }
    
    if (result) {
      const { user, url } = result;
      res.json({
        found: true,
        shortCode: shortCode,
        originalUrl: url.originalUrl,
        userEmail: user.email,
        urlType: typeof url.originalUrl,
        urlLength: url.originalUrl?.length,
        hasProtocol: url.originalUrl?.startsWith('http'),
        createdAt: url.createdAt,
        clickCount: url.clickCount || 0
      });
    } else {
      res.json({
        found: false,
        shortCode: shortCode,
        storage: isDatabaseAvailable() ? 'database' : 'fallback'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      shortCode: req.params.shortcode
    });
  }
});

// Debug route to check stored URLs
router.get('/debug/urls', async (req, res) => {
  try {
    let allUrls = [];
    
    if (isDatabaseAvailable()) {
      const users = await User.find({}, { urls: 1, email: 1 });
      users.forEach(user => {
        user.urls.forEach(url => {
          allUrls.push({
            shortCode: url.shortCode,
            originalUrl: url.originalUrl,
            userEmail: user.email,
            createdAt: url.createdAt
          });
        });
      });
    } else {
      const users = await fallbackStorage.loadData();
      users.forEach(user => {
        user.urls.forEach(url => {
          allUrls.push({
            shortCode: url.shortCode,
            originalUrl: url.originalUrl,
            userEmail: user.email,
            createdAt: url.createdAt
          });
        });
      });
    }
    
    res.json({
      total: allUrls.length,
      urls: allUrls.slice(0, 10), // Show first 10
      storage: isDatabaseAvailable() ? 'database' : 'fallback'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Favicon route (prevent it from being treated as a short code)
router.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content
});

// IMPORTANT: This route must be LAST because it catches all GET requests
// Short URL redirect route - matches any path that looks like a short code
router.get('/:shortcode', async (req, res) => {
  try {
    const shortCode = req.params.shortcode;
    console.log('🔍 Looking up short code:', shortCode);
    
    // Skip common browser requests that aren't short codes
    const skipPaths = ['favicon.ico', 'robots.txt', 'sitemap.xml', '.well-known'];
    if (skipPaths.some(path => shortCode.includes(path))) {
      return res.status(404).send('Not found');
    }
    
    // Basic validation for short codes
    if (!shortCode || shortCode.length < 3 || shortCode.length > 15) {
      return res.status(400).json({
        error: 'Invalid short code',
        message: 'Short code must be between 3 and 15 characters long.'
      });
    }
    
    let result = null;
    
    if (isDatabaseAvailable()) {
      // Use MongoDB
      console.log('🔄 Using MongoDB to find short code');
      result = await User.findByShortCode(shortCode);
    } else {
      // Use fallback storage
      console.log('⚠️ Using fallback storage for redirect');
      result = await fallbackStorage.findByShortCode(shortCode);
    }
    
    console.log('🔍 Search result:', result ? 'Found' : 'Not found');
    
    if (result) {
      const { user, url } = result;
      let originalUrl = url.originalUrl;
      
      console.log('✅ Found URL:', originalUrl);
      console.log('🔗 Original URL type:', typeof originalUrl);
      console.log('🔗 Original URL length:', originalUrl?.length);
      
      // More thorough URL validation and cleaning
      if (!originalUrl) {
        console.error('❌ originalUrl is null/undefined');
        return res.status(400).send('Invalid URL: URL is missing');
      }
      
      if (typeof originalUrl !== 'string') {
        console.error('❌ originalUrl is not a string:', typeof originalUrl);
        return res.status(400).send('Invalid URL: URL is not a string');
      }
      
      // Clean up HTML entities that might have been introduced
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
      
      console.log('🧹 Cleaned URL:', originalUrl);
      
      if (!originalUrl.startsWith('http://') && !originalUrl.startsWith('https://')) {
        console.error('❌ Invalid URL protocol:', originalUrl);
        return res.status(400).send(`Invalid URL: ${originalUrl} does not start with http:// or https://`);
      }
      
      // Try to create a URL object to validate
      try {
        new URL(originalUrl);
      } catch (urlError) {
        console.error('❌ Invalid URL format:', originalUrl, urlError.message);
        return res.status(400).send(`Invalid URL format: ${originalUrl}`);
      }
      
      console.log('✅ URL validation passed, redirecting to:', originalUrl);
      
      // Update click analytics (non-blocking)
      setImmediate(async () => {
        try {
          if (isDatabaseAvailable()) {
            url.clickCount = (url.clickCount || 0) + 1;
            url.lastAccessed = new Date();
            // Update the cleaned URL back to the database
            url.originalUrl = originalUrl;
            await user.save();
          } else {
            await fallbackStorage.updateUrlStats(shortCode);
          }
          console.log(`📊 Click recorded for ${shortCode}`);
        } catch (analyticsError) {
          console.error('⚠️ Failed to update click analytics:', analyticsError.message);
        }
      });
      
      // Perform the redirect
      res.redirect(301, originalUrl);
    } else {
      console.log('❌ Short code not found:', shortCode);
      res.status(404).send(`Short URL not found: ${shortCode}`);
    }
  } catch (error) {
    console.error('❌ Error in redirect:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).send(`Server error: ${error.message}`);
  }
});

export default router;