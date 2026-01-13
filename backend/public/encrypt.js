// Password hashing utility - for testing purposes
import bcrypt from 'bcrypt';
import { configDotenv } from 'dotenv';

configDotenv();

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

// Test password hashing
const testPassword = 'thisismypassword';

const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Original password:', password);
    console.log('Hashed password:', hashedPassword);
    
    // Test comparison
    const isMatch = await bcrypt.compare(password, hashedPassword);
    console.log('Password match test:', isMatch);
    
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
  }
};

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  hashPassword(testPassword);
}
