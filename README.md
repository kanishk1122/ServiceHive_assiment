# SlotSwapper - Full Stack Application

A peer-to-peer time-slot swapping application built with React, TypeScript, Node.js, Express, and MongoDB.

## Tech Stack

**Frontend:** React, TypeScript, Vite, React Router
**Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose), JWT
**Styling:** Custom CSS with dark theme

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account or local MongoDB instance

### Backend Setup
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

Backend will run on http://localhost:4000

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd d:\assiment_3\frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the frontend:
   ```bash
   npm run dev
   ```

Frontend will run on http://localhost:5173

## API Testing with Postman

### Import Collection
1. Open Postman
2. Click "Import" button
3. Select the file: `d:\assiment_3\SlotSwapper_Postman_Collection.json`
4. The collection will be imported with all endpoints and environment variables

### Usage Instructions
1. **Set Base URL**: The collection uses `{{baseUrl}}` variable (default: http://localhost:4000)
2. **Authentication Flow**:
   - Run "Sign Up" or "Login" request first
   - The auth token will be automatically saved and used for subsequent requests
3. **Test Complete Flow**:
   - Sign up → Create events → Make them swappable → Create swap requests → Accept/Reject

### Environment Variables
The collection includes these variables:
- `baseUrl`: Backend URL (http://localhost:4000)
- `authToken`: JWT token (auto-populated after login)
- `userId`: Current user ID (auto-populated)
- `eventId`: Event ID for testing (auto-populated)
- `swapRequestId`: Swap request ID for testing (auto-populated)

## API Endpoints Summary

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

### Utility
- `GET /health` - Health check

## Event Status Types
- `BUSY` - Normal event, not available for swapping
- `SWAPPABLE` - Available for swapping with other users
- `SWAP_PENDING` - Currently part of a pending swap request

## Swap Request Status Types
- `PENDING` - Waiting for response
- `ACCEPTED` - Swap completed successfully
- `REJECTED` - Swap was declined

## Features Implemented

✅ User Authentication (JWT)
✅ Event CRUD Operations
✅ Event Status Management
✅ Swap Request System
✅ Transactional Swap Operations
✅ Real-time State Updates
✅ Responsive Dark Theme UI
✅ SVG Icons
✅ Complete Postman Collection

## Notes
- All swap operations use MongoDB transactions to ensure data consistency
- Only the slot owner can accept/reject swap requests
- Slots become `SWAP_PENDING` when involved in active requests
- Successful swaps exchange ownership and reset status to `BUSY`
