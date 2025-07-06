# Notes App - Full Stack Application

A modern, full-stack notes management application built with FastAPI microservices (backend) and React (frontend). This application provides a complete note-taking solution with user authentication, advanced note organization, and a beautiful, responsive user interface.

## 📝 What This App Does

This notes application allows users to:
- **Create and manage personal accounts** with secure authentication
- **Write, edit, and organize notes** with rich text content
- **Categorize notes** into custom categories for better organization
- **Tag notes** with multiple tags for easy searching and filtering
- **Search through notes** with full-text search capabilities
- **Set note priorities** (low, medium, high) to manage importance
- **View dashboard statistics** showing note counts, categories, and activity
- **Manage user profiles** with customizable information
- **Access notes from any device** with responsive design

## 🚀 Features

### Authentication Service
- User registration and login
- JWT token-based authentication
- Password hashing and validation
- Profile management
- Secure user sessions

### Notes Service
- Create, read, update, and delete notes
- Organize notes with categories and tags
- Full-text search functionality
- Priority levels for notes
- Dashboard with statistics
- User-specific note management

### Frontend
- Modern React-based user interface
- Responsive design for all devices
- Protected routes with authentication
- Real-time note management
- Clean and intuitive user experience

## 🏗️ Architecture

This application follows a microservices architecture:

- **Auth Service** (Port 8001) - Handles user authentication and profile management
- **Notes Service** (Port 8002) - Manages notes, categories, and tags
- **Frontend Service** (Port 3000) - React-based user interface
- **PostgreSQL Database** - Shared database for all services

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **PostgreSQL** - Reliable relational database
- **SQLAlchemy** - SQL toolkit and ORM
- **JWT** - JSON Web Tokens for authentication
- **BCrypt** - Password hashing

### Frontend
- **React** - Component-based UI library
- **JavaScript** - Programming language
- **CSS3** - Modern styling
- **Fetch API** - HTTP client for API calls

## 📋 Prerequisites

Before setting up this project, make sure you have the following installed on your system:

### Required Software
- **Python 3.8 or higher** - Backend services are built with Python
- **Node.js 14 or higher** - Frontend is built with React
- **PostgreSQL 12 or higher** - Database for storing user data and notes
- **npm or yarn** - Package manager for frontend dependencies

### System Requirements
- **Operating System**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **RAM**: Minimum 4GB (8GB recommended for development)
- **Storage**: At least 2GB free space for dependencies and database

### Development Tools (Recommended)
- **VS Code** or any code editor
- **Postman** or similar tool for API testing
- **Git** for version control
- **pgAdmin** or similar tool for PostgreSQL management

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/notes-app.git
cd notes-app
```

### 2. Database Setup
First, make sure PostgreSQL is running on your system, then create the database:

```bash
# Method 1: Using createdb command
createdb notes_app_db

# Method 2: Using psql
psql -U postgres
CREATE DATABASE notes_app_db;
\q
```

### 3. Backend Setup

#### Auth Service
```bash
cd auth_service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database credentials and secret key

# Start the auth service
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

#### Notes Service
```bash
cd notes_service

# Use the same virtual environment
source ../venv/bin/activate  # On Windows: ..\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database credentials and secret key

# Start the notes service
python run.py
# Or: python -m uvicorn app.main:app --host 127.0.0.1 --port 8002 --reload
```

### 4. Frontend Setup
```bash
cd frontend_service

# Install dependencies
npm install

# Start the development server
npm start

# The frontend will be available at http://localhost:3000
```

## ✅ Verification

After starting all services, verify everything is working:

1. **Check Auth Service**: Visit http://localhost:8001/docs
2. **Check Notes Service**: Visit http://localhost:8002/docs  
3. **Check Frontend**: Visit http://localhost:3000
4. **Test Registration**: Create a new user account
5. **Test Login**: Log in with your credentials
6. **Create Notes**: Try creating and managing notes

## 🌐 API Endpoints

### Auth Service (Port 8001)
- `POST /signup` - User registration
- `POST /login` - User authentication
- `GET /dashboard` - Get user profile
- `PUT /profile` - Update user profile

### Notes Service (Port 8002)
- `GET /api/v1/notes` - Get all notes
- `POST /api/v1/notes` - Create new note
- `GET /api/v1/notes/{id}` - Get specific note
- `PUT /api/v1/notes/{id}` - Update note
- `DELETE /api/v1/notes/{id}` - Delete note
- `GET /api/v1/categories` - Get all categories
- `POST /api/v1/categories` - Create category
- `GET /api/v1/tags` - Get all tags
- `POST /api/v1/tags` - Create tag
- `GET /api/v1/dashboard/stats` - Get dashboard statistics

## 🖥️ Access Points

- **Frontend Application**: http://localhost:3000
- **Auth Service API**: http://localhost:8001
- **Notes Service API**: http://localhost:8002
- **Auth API Documentation**: http://localhost:8001/docs
- **Notes API Documentation**: http://localhost:8002/docs

## 🔧 Environment Variables

### Auth Service (.env)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/notes_app_db
SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Notes Service (.env)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/notes_app_db
SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256
HOST=127.0.0.1
PORT=8002
ENVIRONMENT=development
```

## 🚀 Deployment

### Production Setup
1. Set up PostgreSQL database on your production server
2. Configure environment variables for production (use strong secret keys)
3. Build the React frontend: `npm run build`
4. Deploy using Docker, Gunicorn, or your preferred method
5. Set up reverse proxy (Nginx) for production
6. Enable HTTPS for secure authentication

### Docker (Optional)
```bash
# Build and run with Docker Compose (if docker-compose.yml is available)
docker-compose up --build
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Make sure PostgreSQL is running
   - Check database credentials in .env files
   - Verify database exists: `psql -l`

2. **Port Already in Use**
   - Check if services are already running: `lsof -i :8001` or `lsof -i :8002`
   - Kill existing processes or change ports in configuration

3. **JWT Token Issues**
   - Ensure SECRET_KEY is the same in both auth and notes services
   - Check token expiration time
   - Clear browser local storage and try again

4. **Frontend Not Loading**
   - Check if Node.js and npm are properly installed
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

5. **Python Import Errors**
   - Make sure virtual environment is activated
   - Reinstall requirements: `pip install -r requirements.txt`
   - Check Python path and virtual environment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions, please feel free to open an issue on GitHub.

---

**Happy Note Taking!** 📝✨
