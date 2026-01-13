// Simple connection test script
import axios from 'axios';

const API_BASE = 'http://localhost:3000';

async function testConnection() {
  console.log('🧪 Testing backend connection...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);
    
    // Test 2: API test endpoint
    console.log('\n2. Testing API endpoint...');
    const apiResponse = await axios.get(`${API_BASE}/api/test`);
    console.log('✅ API test passed:', apiResponse.data.message);
    
    // Test 3: URL shortening (anonymous)
    console.log('\n3. Testing URL shortening...');
    const shortenResponse = await axios.post(`${API_BASE}/shorten`, {
      originalUrl: 'https://www.google.com'
    });
    console.log('✅ URL shortening passed:', shortenResponse.data.shortUrl);
    
    // Test 4: Test the shortened URL redirect
    const shortCode = shortenResponse.data.shortCode;
    console.log('\n4. Testing redirect...');
    try {
      const redirectResponse = await axios.get(`${API_BASE}/${shortCode}`, {
        maxRedirects: 0,
        validateStatus: (status) => status === 301
      });
      console.log('✅ Redirect test passed: Status', redirectResponse.status);
    } catch (error) {
      if (error.response && error.response.status === 301) {
        console.log('✅ Redirect test passed: Status 301');
      } else {
        throw error;
      }
    }
    
    console.log('\n🎉 All tests passed! Backend is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testConnection();