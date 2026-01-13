import fs from 'fs/promises';
import path from 'path';

// Simple file-based storage as fallback when MongoDB is unavailable
class FallbackStorage {
  constructor() {
    this.dataFile = path.join(process.cwd(), 'data', 'users.json');
    this.ensureDataDirectory();
  }

  async ensureDataDirectory() {
    try {
      await fs.mkdir(path.dirname(this.dataFile), { recursive: true });
    } catch (error) {
      console.error('Failed to create data directory:', error);
    }
  }

  async loadData() {
    try {
      const data = await fs.readFile(this.dataFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // File doesn't exist or is invalid, return empty array
      return [];
    }
  }

  async saveData(data) {
    try {
      await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Failed to save data:', error);
      return false;
    }
  }

  async createUser(userData) {
    const users = await this.loadData();
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Generate unique ID
    const id = Date.now() + Math.floor(Math.random() * 1000);
    
    const newUser = {
      id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      password: userData.password,
      urls: [],
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await this.saveData(users);
    
    return newUser;
  }

  async findUserByEmail(email) {
    const users = await this.loadData();
    return users.find(u => u.email === email);
  }

  async findUserById(id) {
    const users = await this.loadData();
    return users.find(u => u.id === parseInt(id));
  }

  async addUrlToUser(userId, urlData) {
    const users = await this.loadData();
    const userIndex = users.findIndex(u => u.id === parseInt(userId));
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users[userIndex].urls.push(urlData);
    await this.saveData(users);
    
    return users[userIndex];
  }

  async findByShortCode(shortCode) {
    const users = await this.loadData();
    
    for (const user of users) {
      const url = user.urls.find(u => u.shortCode === shortCode);
      if (url) {
        return { user, url };
      }
    }
    
    return null;
  }

  async shortCodeExists(shortCode) {
    const result = await this.findByShortCode(shortCode);
    return result !== null;
  }

  async updateUrlStats(shortCode) {
    const users = await this.loadData();
    
    for (let i = 0; i < users.length; i++) {
      const urlIndex = users[i].urls.findIndex(u => u.shortCode === shortCode);
      if (urlIndex !== -1) {
        users[i].urls[urlIndex].clickCount = (users[i].urls[urlIndex].clickCount || 0) + 1;
        users[i].urls[urlIndex].lastAccessed = new Date().toISOString();
        await this.saveData(users);
        return users[i];
      }
    }
    
    return null;
  }
}

export default FallbackStorage;