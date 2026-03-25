# Hostel Room Booking System (Minimal MERN)

This is a minimal full-stack MERN application focusing on Firebase authentication and user synchronization with MongoDB.

## Tech Stack
- **Frontend**: React (Vite), Bootstrap, Firebase (Authentication)
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)

## Setup Instructions

### 1. Prerequisites
- Node.js installed
- MongoDB running locally at `mongodb://127.0.0.1:27017/hostel`

### 2. Backend Setup
1. Navigate to the `backend` folder: `cd backend`
2. Install dependencies: `npm install`
3. Start the server: `npm run dev`
   - The server will run on `http://localhost:5000`

### 3. Frontend Setup
1. Navigate to the `frontend` folder: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
   - The app will run on `http://localhost:3000`

## Features
- **Firebase Auth**: Custom Sign Up and Sign In using Email/Password.
- **Protected Routes**: Dashboard is only accessible to authenticated users.
- **User Sync**: When a user registers/logs in, their details (Name, Email, Firebase UID) are synced to MongoDB.
- **Backend Connection**: Dashboard displays the status of the backend API and MongoDB sync.

## API Endpoints
- `GET /api/test`: Test backend connectivity.
- `POST /api/users`: Save or sync user data from Firebase.
