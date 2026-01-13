# Frontend Integration Guide

## JWT Token Authentication

### 1. Store Token After Login/Signup
```javascript
// After successful login/signup
const response = await axios.post('/signup', userData);
const { token, user } = response.data;

// Store token in localStorage
localStorage.setItem('authToken', token);
localStorage.setItem('user', JSON.stringify(user));
```

### 2. Include Token in API Requests
```javascript
// Get token from localStorage
const token = localStorage.getItem('authToken');

// Include in Authorization header
const config = {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

// Example: Fetch user URLs
const response = await axios.get(`/user/${userId}/urls`, config);
```

### 3. Create Axios Interceptor (Recommended)
```javascript
// Set up axios interceptor to automatically include token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses (token expired)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## API Endpoints

### Authentication
- `POST /signup` - Returns `{ token, user }`
- `POST /login` - Returns `{ token, user }`

### URL Shortening
- `POST /shorten` - Create short URL (optional auth)
  ```javascript
  {
    "originalUrl": "https://example.com"
  }
  ```

### Protected Routes (Require JWT Token)
- `GET /user/:userId/urls` - Get user's URLs
  - Requires: `Authorization: Bearer <token>`
  - User can only access their own URLs

### Public Routes
- `GET /:shortcode` - Redirect to original URL
- `GET /health` - Server health check

## Error Handling

### Common HTTP Status Codes
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (access denied)
- `404` - Not Found
- `409` - Conflict (user already exists)
- `500` - Internal Server Error

### Example Error Response
```javascript
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

## Complete Example: TinyURL Component

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

const TinyURL = () => {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [userUrls, setUserUrls] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    // Fetch user URLs if logged in
    if (user) {
      fetchUserUrls();
    }
  }, [user]);

  const fetchUserUrls = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`/user/${user.id}/urls`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUserUrls(response.data.urls);
    } catch (error) {
      console.error('Error fetching URLs:', error);
      if (error.response?.status === 401) {
        // Token expired
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const config = token ? {
        headers: { 'Authorization': `Bearer ${token}` }
      } : {};

      const response = await axios.post('/shorten', 
        { originalUrl: url }, 
        config
      );
      
      setShortUrl(response.data.shortUrl);
      
      // Refresh user URLs if logged in
      if (user) {
        fetchUserUrls();
      }
    } catch (error) {
      console.error('Error shortening URL:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleShorten}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL to shorten"
          required
        />
        <button type="submit">Shorten</button>
      </form>

      {shortUrl && (
        <div>
          <p>Short URL: <a href={shortUrl}>{shortUrl}</a></p>
        </div>
      )}

      {user && (
        <div>
          <h3>Your URLs</h3>
          {userUrls.map((urlObj, index) => (
            <div key={index}>
              <p>
                <a href={urlObj.compeleturl}>{urlObj.compeleturl}</a>
                → {urlObj.originalUrl}
                (Clicks: {urlObj.clickCount || 0})
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TinyURL;
```

## Testing Short URLs

1. **Create a short URL** via `/shorten`
2. **Copy the returned shortUrl** (e.g., `http://localhost:3000/abc12`)
3. **Visit the short URL** in browser - it should redirect to original URL
4. **Check server console** for redirect logs

If redirect isn't working:
- Check server console for error messages
- Verify the short code exists in database/fallback storage
- Test with `/health` endpoint to see storage method