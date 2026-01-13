# Troubleshooting Guide

## Database Connection Issues

### Error: `querySrv ETIMEOUT _mongodb._tcp.cluster0.m02vzag.mongodb.net`

This error indicates a **DNS/Network timeout** when connecting to MongoDB Atlas.

#### Possible Causes & Solutions:

1. **Network/Internet Issues**
   - Check your internet connection
   - Try accessing other websites to confirm connectivity

2. **Corporate/School Firewall**
   - MongoDB Atlas uses port 27017
   - Ask your network admin to whitelist MongoDB Atlas domains
   - Try using a different network (mobile hotspot)

3. **MongoDB Atlas Cluster Issues**
   - Check if your cluster is paused (free tier clusters pause after inactivity)
   - Log into MongoDB Atlas dashboard to verify cluster status
   - Restart the cluster if it's paused

4. **DNS Resolution Issues**
   - Try flushing DNS cache: `ipconfig /flushdns` (Windows)
   - Try using Google DNS (8.8.8.8, 8.8.4.4)

#### Fallback Solution
The application now includes **fallback file storage** that automatically activates when MongoDB is unavailable:
- Data is stored in `backend/data/users.json`
- All functionality works the same
- Check `/health` endpoint to see current storage method

## Signup 400 Bad Request Issues

### Common Validation Errors:

1. **Password Requirements** (Fixed)
   - **Old**: Required uppercase, lowercase, number, AND special character
   - **New**: Only requires at least one letter and one number
   - Minimum 6 characters (was 8)

2. **Name Validation**
   - First/last name: Only letters and spaces allowed
   - Length: 1-50 characters

3. **Email Validation**
   - Must be valid email format
   - Maximum 100 characters

### Testing Signup:
```bash
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe", 
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Quick Fixes

### 1. Restart MongoDB Atlas Cluster
1. Go to MongoDB Atlas dashboard
2. Find your cluster
3. Click "..." → "Edit"
4. Save without changes (this restarts it)

### 2. Test with Fallback Storage
- The app automatically uses file storage when DB is unavailable
- Check `/health` to confirm storage method
- Data persists in `backend/data/users.json`

### 3. Check Server Status
```bash
curl http://localhost:3000/health
```

### 4. Test Signup with Simple Data
```json
{
  "first_name": "Test",
  "last_name": "User",
  "email": "test@test.com", 
  "password": "test123"
}
```

## Environment Variables Check

Ensure your `.env` file has:
```env
MONGODB_URI="your-connection-string"
JWT_SECRET="your-jwt-secret"
PORT=3000
BASE_URL="http://localhost:3000"
```

## Still Having Issues?

1. Check the server console for detailed error messages
2. Verify all npm packages are installed: `npm install`
3. Try restarting the server: `node server.js`
4. Check if port 3000 is available: `netstat -an | findstr :3000`