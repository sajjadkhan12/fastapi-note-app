# Frontend Service - Notes App

A beautiful and modern React frontend for the Notes App authentication system.

## Features

- **Beautiful UI Design** - Clean, modern interface with gradient backgrounds
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Authentication Flow** - Complete signup → login → profile flow
- **Protected Routes** - Secure access to profile page
- **JWT Token Management** - Automatic token handling and refresh
- **Form Validation** - Client-side and server-side validation
- **Loading States** - Beautiful loading indicators
- **Error Handling** - User-friendly error messages

## Tech Stack

- **React 18** - Modern React with hooks
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling with gradients and animations
- **Context API** - State management for authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Auth Service running on `http://localhost:8000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## API Integration

The frontend integrates with the following auth service endpoints:

- `POST /signup` - User registration
- `POST /login` - User authentication
- `GET /profile` - Protected user profile (requires JWT token)

## Project Structure

```
frontend_service/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/
│   │   └── ProtectedRoute.js   # Route protection component
│   ├── pages/
│   │   ├── SignUpPage.js       # User registration page
│   │   ├── LoginPage.js        # User login page
│   │   └── ProfilePage.js      # User profile page
│   ├── services/
│   │   └── authService.js      # API service layer
│   ├── utils/
│   │   └── AuthContext.js      # Authentication context
│   ├── App.js              # Main app component
│   ├── index.js           # Entry point
│   └── index.css          # Global styles
├── package.json
└── .env                   # Environment variables
```

## User Flow

1. **Landing** - Users start at login page (`/`)
2. **Registration** - New users can create account (`/signup`)
3. **Login** - Users authenticate (`/login`)
4. **Profile** - Authenticated users view profile (`/profile`)
5. **Logout** - Users can sign out and return to login

## Design Features

- **Gradient Backgrounds** - Beautiful purple/blue gradients
- **Card-based Layout** - Clean white cards with subtle shadows
- **Modern Typography** - Inter font family for readability
- **Smooth Animations** - Hover effects and loading animations
- **Responsive Grid** - Flexible layout for all screen sizes
- **Form Validation** - Real-time validation with error states

## Environment Variables

- `REACT_APP_API_BASE_URL` - Base URL for the auth service API

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App
