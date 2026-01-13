# TinyURL Application

A full-stack URL shortener application built with React and Express.js.

## Project Structure

```
├── backend/                 # Express.js API server
│   ├── server.js           # Main server file
│   ├── public/             # Static files and routes
│   ├── utils/              # Utility functions
│   ├── middleware/         # Express middleware
│   └── .env               # Backend environment variables
├── frontend/
│   └── tinyurl-frontend/   # React application
│       ├── src/           # React source code
│       ├── public/        # Static assets
│       └── .env          # Frontend environment variables
└── package.json           # Root package.json with scripts
```

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install
   ```

2. **Set up environment variables:**
   
   Backend (`.env` in `backend/` directory):
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=3000
   BASE_URL=http://localhost:3000
   ```
   
   Frontend (`.env` in `frontend/tinyurl-frontend/` directory):
   ```
   VITE_API_BASE_URL=http://localhost:3000
   ```

3. **Start development servers:**
   ```bash
   npm run dev
   ```
   
   This will start:
   - Backend server on http://localhost:3000
   - Frontend development server on http://localhost:5173

### Individual Commands

- **Backend only:** `npm run dev:backend`
- **Frontend only:** `npm run dev:frontend`
- **Build frontend:** `npm run build`

## Features

- ✅ URL shortening with custom short codes
- ✅ User authentication (signup/login)
- ✅ Anonymous URL shortening (limited)
- ✅ User dashboard with URL history
- ✅ Click analytics
- ✅ Responsive design with dark/light theme
- ✅ Rate limiting and security features
- ✅ Fallback storage when database is unavailable

## API Endpoints

- `POST /signup` - User registration
- `POST /login` - User authentication
- `POST /shorten` - Create short URL
- `GET /user/:id/urls` - Get user's URLs
- `GET /:shortcode` - Redirect to original URL
- `GET /health` - Health check

## Technology Stack

**Frontend:**
- React 19
- Vite
- Tailwind CSS
- Radix UI components
- Axios for API calls

**Backend:**
- Express.js
- MongoDB with Mongoose
- JWT authentication
- bcrypt for password hashing
- Rate limiting and security middleware