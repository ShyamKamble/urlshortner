import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { configDotenv } from 'dotenv';

// Import our modules
import { MONGODB_URI } from './Schema.js';
import router from './public/routes.js';
import { sanitizeInputs } from './utils/validation.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { DatabaseManager } from './utils/database.js';

// Load environment variables
configDotenv();

const app = express();
const port = process.env.PORT || 3000;

// Initialize database manager
const dbManager = new DatabaseManager(MONGODB_URI);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// HTTPS enforcement in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Rate limiting with environment configuration
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: process.env.NODE_ENV === 'production' // Trust proxy in production
});

// Stricter rate limiting for URL shortening
const shortenLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.SHORTEN_RATE_LIMIT_MAX) || 20,
  message: {
    error: 'Too many URL shortening requests, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: process.env.NODE_ENV === 'production'
});

// Stricter rate limiting for authentication
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5,
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: process.env.NODE_ENV === 'production'
});

// Apply rate limiting
app.use('/api/', limiter);
app.use('/shorten', shortenLimiter);
app.use('/login', authLimiter);
app.use('/signup', authLimiter);

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)
      : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization middleware
app.use(sanitizeInputs);

// Remove database requirement - we have fallback storage
// app.use(['/shorten', '/signup', '/login'], requireDatabase);

app.use(express.static('public'));
app.use('/', router);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Enhanced database connection with retry logic
const connectDatabase = async () => {
  try {
    await dbManager.connect();
  } catch (error) {
    console.error('❌ Failed to connect to database after all retries');
    console.log('🔄 Server will continue running with limited functionality');
  }
};

// Handle graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🔄 Received ${signal}, shutting down...`);

  try {
    // Close HTTP server
    server.close(() => {
      console.log('✅ HTTP server closed');
    });

    // Close database connection
    await dbManager.disconnect();

    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle different shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // Nodemon restart

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start database connection (non-blocking)
connectDatabase();

// Start server immediately
const server = app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Base URL: ${process.env.BASE_URL || `http://localhost:${port}`}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`📈 Database status: http://localhost:${port}/health/database`);
});

// Make dbManager available to routes
app.locals.dbManager = dbManager;