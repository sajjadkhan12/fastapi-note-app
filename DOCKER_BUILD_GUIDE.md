# 🐳 Docker Build and Test Guide

## Build Individual Services

### Auth Service
```bash
cd auth_service
docker build -t notes-auth-service:latest .

# Test the image
docker run --rm -p 8001:8001 \
  -e DATABASE_URL=postgresql://user:password@host.docker.internal:5432/notesapp \
  notes-auth-service:latest
```

### Notes Service
```bash
cd notes_service
docker build -t notes-notes-service:latest .

# Test the image
docker run --rm -p 8002:8002 \
  -e DATABASE_URL=postgresql://user:password@host.docker.internal:5432/notesapp \
  notes-notes-service:latest
```

### Frontend Service
```bash
cd frontend_service
docker build -t notes-frontend:latest .

# Test the image
docker run --rm -p 3000:80 notes-frontend:latest
```

## Build All Services
```bash
# From the project root
docker-compose build

# Or build individually with tags
docker build -t notes-auth-service:latest ./auth_service
docker build -t notes-notes-service:latest ./notes_service
docker build -t notes-frontend:latest ./frontend_service
```

## Features of the Dockerfiles

### Security Features ✅
- Non-root user execution
- Minimal base images (slim/alpine)
- Security headers in nginx
- Proper file permissions

### Performance Features ✅
- Multi-stage builds (frontend)
- Optimized layer caching
- Gzip compression (frontend)
- Health checks for all services

### Production Ready ✅
- Environment variable support
- Proper error handling
- Resource optimization
- Container best practices

## Docker Commands for Testing

### Check Health
```bash
# Auth service health
curl http://localhost:8001/health

# Notes service health
curl http://localhost:8002/health

# Frontend health
curl http://localhost:3000/health
```

### View Logs
```bash
docker logs <container_id> -f
```

### Inspect Images
```bash
docker images | grep notes
docker inspect notes-auth-service:latest
```

Your Dockerfiles are now production-ready! 🚀
