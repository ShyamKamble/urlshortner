import mongoose from 'mongoose';

/**
 * Enhanced database connection with retry logic and monitoring
 */
export class DatabaseManager {
  constructor(uri) {
    this.uri = uri;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 5;
    this.retryDelay = 2000; // 2 seconds
    
    // Connection event listeners
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    mongoose.connection.on('connected', () => {
      console.log('✅ Database connected successfully');
      this.isConnected = true;
      this.connectionAttempts = 0;
    });
    
    mongoose.connection.on('error', (error) => {
      console.error('❌ Database connection error:', error.message);
      this.isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Database disconnected');
      this.isConnected = false;
      
      // Auto-reconnect if not intentionally disconnected
      if (this.connectionAttempts < this.maxRetries) {
        this.reconnect();
      }
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ Database reconnected');
      this.isConnected = true;
    });
  }
  
  async connect() {
    try {
      console.log('🔄 Connecting to database...');
      
      await mongoose.connect(this.uri, {
        // Connection Pool Settings
        maxPoolSize: 10,          // Maximum number of connections
        minPoolSize: 2,           // Minimum number of connections
        maxIdleTimeMS: 30000,     // Close connections after 30 seconds of inactivity
        
        // Timeout Settings
        serverSelectionTimeoutMS: 5000,  // How long to try selecting a server
        socketTimeoutMS: 45000,          // How long a send or receive on a socket can take
        connectTimeoutMS: 10000,         // How long to wait for initial connection
        
        // Retry Settings
        retryWrites: true,        // Retry failed writes
        retryReads: true,         // Retry failed reads
        
        // Monitoring
        heartbeatFrequencyMS: 10000,     // How often to check server status
      });
      
      this.isConnected = true;
      return true;
      
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      this.isConnected = false;
      
      if (this.connectionAttempts < this.maxRetries) {
        return this.reconnect();
      }
      
      throw error;
    }
  }
  
  async reconnect() {
    this.connectionAttempts++;
    const delay = this.retryDelay * this.connectionAttempts;
    
    console.log(`🔄 Retrying database connection (${this.connectionAttempts}/${this.maxRetries}) in ${delay}ms...`);
    
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          await this.connect();
          resolve(true);
        } catch (error) {
          console.error(`❌ Reconnection attempt ${this.connectionAttempts} failed:`, error.message);
          resolve(false);
        }
      }, delay);
    });
  }
  
  async disconnect() {
    try {
      await mongoose.connection.close();
      console.log('✅ Database connection closed gracefully');
      this.isConnected = false;
    } catch (error) {
      console.error('❌ Error closing database connection:', error);
    }
  }
  
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      readyStateText: this.getReadyStateText(),
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      connectionAttempts: this.connectionAttempts
    };
  }
  
  getReadyStateText() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[mongoose.connection.readyState] || 'unknown';
  }
  
  // Health check for the database
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { status: 'unhealthy', message: 'Database not connected' };
      }
      
      // Simple ping to check if database is responsive
      await mongoose.connection.db.admin().ping();
      
      return {
        status: 'healthy',
        message: 'Database is responsive',
        ...this.getConnectionStatus()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message,
        ...this.getConnectionStatus()
      };
    }
  }
}

// Middleware to check database connection before operations
export const requireDatabase = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Database connection is not available. Please try again later.',
      status: mongoose.connection.readyState
    });
  }
  next();
};

// Middleware for graceful degradation
export const gracefulDegradation = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    // Add a flag to indicate database is unavailable
    req.dbUnavailable = true;
  }
  next();
};