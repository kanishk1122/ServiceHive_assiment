# SlotSwapper - Full Stack Application

A peer-to-peer time-slot swapping application built with React, TypeScript, Node.js, Express, and MongoDB.

## 🚀 Live Application

**Backend API:** [backend](https://servicehive-assiment.onrender.com)
**Frontend:** [frontend](https://service-hive-assiment-i8xj6a3zb-kanishk1122s-projects.vercel.app/)

## Tech Stack

**Frontend:** React, TypeScript, Vite, React Router
**Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose), JWT
**Database:** MongoDB Atlas
**Deployment:** Render (Backend), Vercel (Frontend)
**Styling:** Custom CSS with pure black & white theme

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account or local MongoDB instance

### Backend Setup (Local Development)
1. Navigate to backend directory:
   ```bash
   cd d:\assiment_3\backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment setup:
   - Copy `.env.example` to `.env`
   - Update the MongoDB URI and JWT secret in `.env`

4. Run the backend:
   ```bash
   npm run dev
   ```

Local backend will run on http://localhost:4000

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd d:\assiment_3\frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update API base URL in `src/api.ts`:
   ```typescript
   // For production
   baseURL: 'https://servicehive-assiment.onrender.com/api'
   
   // For local development
   baseURL: 'http://localhost:4000/api'
   ```

4. Run the frontend:
   ```bash
   npm run dev
   ```

Frontend will run on http://localhost:5173

## 🧪 API Testing with Postman

### Import Collection
1. Open Postman
2. Click "Import" button
3. Select the file: `d:\assiment_3\SlotSwapper_Postman_Collection.json`
4. The collection will be imported with all endpoints and environment variables

### Usage Instructions
1. **Set Base URL**: Update the `{{baseUrl}}` variable:
   - **Production:** `https://servicehive-assiment.onrender.com`
   - **Local:** `http://localhost:4000`

2. **Authentication Flow**:
   - Run "Sign Up" or "Login" request first
   - The auth token will be automatically saved and used for subsequent requests

3. **Test Complete Flow**:
   - Sign up → Create events → Make them swappable → Create swap requests → Accept/Reject

### Environment Variables
The collection includes these variables:
- `baseUrl`: Backend URL (Production: https://servicehive-assiment.onrender.com)
- `authToken`: JWT token (auto-populated after login)
- `userId`: Current user ID (auto-populated)
- `eventId`: Event ID for testing (auto-populated)
- `swapRequestId`: Swap request ID for testing (auto-populated)

## 📋 API Endpoints Summary

**Base URL:** `https://servicehive-assiment.onrender.com`

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - User login

### Events (Auth Required)
- `GET /api/events/my` - Get user's events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `PUT /api/events/:id/status` - Update event status
- `DELETE /api/events/:id` - Delete event

### Swap Operations (Auth Required)
- `GET /api/swappable-slots` - Get available slots from other users
- `POST /api/swap-request` - Create swap request
- `POST /api/swap-response/:requestId` - Accept/reject swap request
- `GET /api/requests` - Get incoming/outgoing requests

### Notifications (Auth Required)
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

### Utility
- `GET /health` - Health check

## 📊 Data Models

### Event Status Types
- `BUSY` - Normal event, not available for swapping
- `SWAPPABLE` - Available for swapping with other users
- `SWAP_PENDING` - Currently part of a pending swap request

### Swap Request Status Types
- `PENDING` - Waiting for response
- `ACCEPTED` - Swap completed successfully
- `REJECTED` - Swap was declined

## ✅ Features Implemented

### Core Features
✅ User Authentication (JWT)
✅ Event CRUD Operations
✅ Event Status Management
✅ Swap Request System
✅ Transactional Swap Operations
✅ Real-time State Updates

### UI/UX Features
✅ Fully Responsive Design (Mobile, Tablet, Desktop)
✅ Pure Black & White Theme
✅ SVG Icons Throughout
✅ Touch-Friendly Mobile Interface
✅ Accessible Design

### Developer Tools
✅ Complete Postman Collection
✅ Environment Variables Configuration
✅ TypeScript Throughout
✅ Comprehensive Error Handling

### Deployment
✅ Backend Deployed on Render
✅ MongoDB Atlas Integration
✅ CORS Configuration for Production
✅ Environment-based Configuration

## 🔧 Technical Notes

### Database Operations
- All swap operations use MongoDB transactions to ensure data consistency
- Only the slot owner can accept/reject swap requests
- Slots become `SWAP_PENDING` when involved in active requests
- Successful swaps exchange ownership and reset status to `BUSY`

### Security
- JWT-based authentication
- CORS policy configured for production domains
- Input validation on all endpoints
- Password hashing with bcrypt

### Performance
- Database indexes on frequently queried fields
- Optimized queries with proper population
- Transaction-based operations for data integrity

## 🌐 Deployment Information

### Backend (Render)
- **URL:** https://servicehive-assiment.onrender.com
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Environment:** Node.js 18+

### Database
- **MongoDB Atlas** with connection pooling
- **Automatic failover** and backup
- **Global cluster** for optimal performance

### Frontend
- Ready for deployment on Vercel, Netlify, or similar platforms
- Static build with Vite
- Environment variables for API configuration

## 🚀 Quick Test with cURL

```bash
# Health check
curl https://servicehive-assiment.onrender.com/health

# Sign up
curl -X POST https://servicehive-assiment.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST https://servicehive-assiment.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📞 Support

For any issues or questions, please check the API endpoints with the provided Postman collection or refer to the comprehensive error messages returned by the API.
