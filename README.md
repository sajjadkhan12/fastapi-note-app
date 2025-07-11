# 📝 Notes App - Production-Grade Kubernetes Deployment

A secure, scalable notes application built with React frontend, FastAPI microservices, and deployed on Kubernetes with comprehensive monitoring.

![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688)
![Database](https://img.shields.io/badge/Database-PostgreSQL-336791)
![Deployment](https://img.shields.io/badge/Deployment-Kubernetes-326CE5)
![Monitoring](https://img.shields.io/badge/Monitoring-Prometheus%20%2B%20Grafana-E6522C)

## 🏗️ Architecture Overview

This project implements a modern microservices architecture with the following components:

### **Frontend Service**
- **Technology**: React.js with modern hooks
- **Features**: 
  - User authentication (Sign up/Sign in)
  - Notes CRUD operations
  - Responsive design
  - Real-time data updates
- **Deployment**: Nginx-served static files with API proxy

### **Auth Service**
- **Technology**: FastAPI (Python)
- **Features**:
  - User registration and authentication
  - JWT token management
  - Password hashing and validation
  - Secure session handling
- **Database**: PostgreSQL with user management

### **Notes Service**
- **Technology**: FastAPI (Python)
- **Features**:
  - CRUD operations for notes
  - User-specific note isolation
  - RESTful API design
  - Data validation and serialization
- **Database**: PostgreSQL with notes storage

### **Database**
- **Technology**: PostgreSQL 13
- **Features**:
  - Persistent data storage
  - ACID compliance
  - Optimized for read/write operations
  - Backup and recovery ready

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Kubernetes cluster (local or cloud)
- kubectl configured
- Helm (optional, for package management)

### Local Development with Docker Compose

```bash
# Clone the repository
git clone <repository-url>
cd notes-app

# Start all services
docker-compose up -d

# Access the application
open http://localhost:3001
```

### Production Deployment on Kubernetes

```bash
# Deploy the complete stack
cd k8s
./deploy.sh

# Access via HTTPS
open https://notes.local/
```

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React.js, Nginx | User interface and static file serving |
| **Auth Service** | FastAPI, Python | Authentication and user management |
| **Notes Service** | FastAPI, Python | Notes CRUD operations |
| **Database** | PostgreSQL | Data persistence |
| **Orchestration** | Kubernetes | Container orchestration |
| **Ingress** | NGINX Ingress Controller | HTTP/HTTPS routing |
| **Monitoring** | Prometheus, Grafana | Metrics and visualization |
| **Alerting** | Alertmanager | Alert management |
| **Scaling** | HPA (Horizontal Pod Autoscaler) | Auto-scaling |

## 🏃‍♂️ Development Setup

### 1. Frontend Development

```bash
cd frontend_service
npm install
npm start
# Runs on http://localhost:3000
```

### 2. Auth Service Development

```bash
cd auth_service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
# Runs on http://localhost:8001
```

### 3. Notes Service Development

```bash
cd notes_service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
# Runs on http://localhost:8002
```

### 4. Database Setup

```bash
# Using Docker
docker run --name postgres-dev \
  -e POSTGRES_DB=notesapp \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:13
```

## 🐳 Docker Deployment

### Build and Run with Docker Compose

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Individual Service Builds

```bash
# Frontend
docker build -t notes-frontend ./frontend_service

# Auth Service
docker build -t notes-auth-service ./auth_service

# Notes Service
docker build -t notes-notes-service ./notes_service
```

## ☸️ Kubernetes Deployment

### Complete Production Deployment

```bash
cd k8s

# Deploy all components
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-secrets.yaml
kubectl apply -f 02-postgres.yaml
kubectl apply -f 03-auth-service.yaml
kubectl apply -f 04-notes-service.yaml
kubectl apply -f 05-frontend.yaml
kubectl apply -f 05-frontend-nginx-config.yaml
kubectl apply -f 06-ingress-final.yaml
kubectl apply -f 07-prometheus.yaml
kubectl apply -f 08-grafana.yaml
kubectl apply -f 09-alertmanager.yaml
kubectl apply -f 10-hpa.yaml

# Or use the deploy script
./deploy.sh
```

### Quick Deployment Script

```bash
#!/bin/bash
# k8s/deploy.sh

echo "🚀 Deploying Notes App to Kubernetes..."

# Apply all manifests
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-secrets.yaml
kubectl apply -f 02-postgres.yaml
kubectl apply -f 03-auth-service.yaml
kubectl apply -f 04-notes-service.yaml
kubectl apply -f 05-frontend.yaml
kubectl apply -f 05-frontend-nginx-config.yaml
kubectl apply -f 06-ingress-final.yaml
kubectl apply -f 07-prometheus.yaml
kubectl apply -f 08-grafana.yaml
kubectl apply -f 09-alertmanager.yaml
kubectl apply -f 10-hpa.yaml

echo "✅ Deployment complete!"
echo "📊 Access the app: https://notes.local/"
echo "🔧 Monitor via port-forward:"
echo "   kubectl port-forward -n notes-app service/grafana-service 3000:3000"
echo "   kubectl port-forward -n monitoring service/prometheus 9090:9090"
```

## 🔒 Security Features

### HTTPS/TLS
- ✅ TLS 1.2/1.3 encryption
- ✅ Self-signed certificates for local development
- ✅ HSTS headers for security
- ✅ SSL redirect enforcement

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Password hashing (bcrypt)
- ✅ Session management
- ✅ User isolation

### Kubernetes Security
- ✅ Kubernetes secrets for sensitive data
- ✅ Network policies for pod-to-pod communication
- ✅ Security contexts and non-root containers
- ✅ Resource limits and quotas

### Web Security Headers
- ✅ Content Security Policy (CSP)
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection
- ✅ Referrer Policy

## 📊 Monitoring & Observability

### Metrics Collection
- **Prometheus**: Collects metrics from all services
- **cAdvisor**: Container resource metrics
- **Node Exporter**: System-level metrics
- **PostgreSQL Exporter**: Database metrics

### Visualization
- **Grafana**: Rich dashboards and alerting
- **Pre-built dashboards**: Kubernetes cluster monitoring
- **Custom dashboards**: Application-specific metrics

### Alerting
- **Alertmanager**: Manages alerts and notifications
- **Alert rules**: CPU, memory, disk usage thresholds
- **Notification channels**: Email, Slack integration ready

### Access Monitoring

```bash
# Grafana Dashboard
kubectl port-forward -n notes-app service/grafana-service 3000:3000
# Access: http://localhost:3000/grafana/login (admin/admin123)

# Prometheus Dashboard
kubectl port-forward -n monitoring service/prometheus 9090:9090
# Access: http://localhost:9090

# Alertmanager Dashboard
kubectl port-forward -n monitoring service/alertmanager 9093:9093
# Access: http://localhost:9093
```

## 📈 Auto-Scaling

### Horizontal Pod Autoscaler (HPA)
```yaml
# Configured for all services
- Frontend: 2-10 replicas (CPU > 70%)
- Auth Service: 2-8 replicas (CPU > 70%)
- Notes Service: 2-8 replicas (CPU > 70%)
```

### Monitoring Scaling
```bash
# Check HPA status
kubectl get hpa -n notes-app

# View scaling events
kubectl describe hpa -n notes-app
```

## 🗂️ Project Structure

```
notes-app/
├── README.md                    # This file
├── docker-compose.yml          # Local development setup
├── frontend_service/            # React frontend
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── auth_service/               # Authentication microservice
│   ├── app/
│   ├── requirements.txt
│   └── Dockerfile
├── notes_service/              # Notes management microservice
│   ├── app/
│   ├── requirements.txt
│   └── Dockerfile
└── k8s/                        # Kubernetes manifests
    ├── 00-namespace.yaml
    ├── 01-secrets.yaml
    ├── 02-postgres.yaml
    ├── 03-auth-service.yaml
    ├── 04-notes-service.yaml
    ├── 05-frontend.yaml
    ├── 06-ingress-final.yaml
    ├── 07-prometheus.yaml
    ├── 08-grafana.yaml
    ├── 09-alertmanager.yaml
    ├── 10-hpa.yaml
    ├── deploy.sh
    ├── cleanup.sh
    └── docs/
        ├── DEPLOYMENT_SUCCESS.md
        ├── GRAFANA_QUICK_START.md
        ├── PROMETHEUS_GUIDE.md
        └── MONITORING_ACCESS.md
```

## 🌐 API Documentation

### Auth Service Endpoints
```
POST /signup         - User registration
POST /login          - User authentication
POST /logout         - User logout
GET  /profile        - Get user profile
PUT  /profile        - Update user profile
GET  /health         - Service health check
```

### Notes Service Endpoints
```
GET    /api/v1/notes      - List all notes for user
POST   /api/v1/notes      - Create new note
GET    /api/v1/notes/{id} - Get specific note
PUT    /api/v1/notes/{id} - Update note
DELETE /api/v1/notes/{id} - Delete note
GET    /api/v1/health     - Service health check
```

## 🔧 Configuration

### Environment Variables

#### Auth Service
```bash
DATABASE_URL=postgresql://user:password@postgres:5432/notesapp
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

#### Notes Service
```bash
DATABASE_URL=postgresql://user:password@postgres:5432/notesapp
AUTH_SERVICE_URL=http://auth-service:8001
```

#### Frontend
```bash
REACT_APP_AUTH_API_URL=http://localhost:8001
REACT_APP_NOTES_API_URL=http://localhost:8002
```

### Kubernetes Secrets
All sensitive configuration is stored in Kubernetes secrets:
- Database credentials
- JWT secrets
- TLS certificates

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database pod
kubectl get pods -n notes-app | grep postgres

# Check database logs
kubectl logs -n notes-app deployment/postgres

# Test database connectivity
kubectl exec -n notes-app deployment/postgres -it -- psql -U user -d notesapp -c "SELECT 1;"
```

#### Service Communication Issues
```bash
# Check service endpoints
kubectl get endpoints -n notes-app

# Test service connectivity
kubectl exec -n notes-app deployment/auth-service -it -- curl http://postgres:5432

# Check ingress status
kubectl get ingress -n notes-app
kubectl describe ingress notes-app-ingress -n notes-app
```

#### Frontend Not Loading
```bash
# Check frontend pods
kubectl get pods -n notes-app | grep frontend

# Check frontend logs
kubectl logs -n notes-app deployment/frontend

# Test static file serving
curl -k https://notes.local/
```

### Logs and Debugging

```bash
# View all pods status
kubectl get pods -n notes-app

# Check specific service logs
kubectl logs -n notes-app deployment/auth-service -f
kubectl logs -n notes-app deployment/notes-service -f
kubectl logs -n notes-app deployment/frontend -f

# Check events
kubectl get events -n notes-app --sort-by='.lastTimestamp'
```

## 🧪 Testing

### API Testing with curl

```bash
# Health checks
curl -k https://notes.local/api/v1/auth/health
curl -k https://notes.local/api/v1/health

# User registration
curl -X POST https://notes.local/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","confirm_password":"password123"}'

# User login
curl -X POST https://notes.local/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 https://notes.local/

# Using kubectl for stress testing
kubectl run stress-test --image=nginx --restart=Never
```

## 📱 Access URLs

### Production (Kubernetes)
- **Main Application**: https://notes.local/
- **Auth API**: https://notes.local/api/v1/auth/
- **Notes API**: https://notes.local/api/v1/

### Development (Docker Compose)
- **Frontend**: http://localhost:3001/
- **Auth Service**: http://localhost:8001/
- **Notes Service**: http://localhost:8002/
- **Database**: postgresql://localhost:5432/notesapp

### Monitoring (Port-Forward Required)
- **Grafana**: http://localhost:3000/grafana/login
- **Prometheus**: http://localhost:9090/
- **Alertmanager**: http://localhost:9093/

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- FastAPI for the excellent Python web framework
- React team for the frontend framework
- Kubernetes community for container orchestration
- Prometheus & Grafana for monitoring solutions
- PostgreSQL for reliable data storage

---

**Built with ❤️ for modern cloud-native applications**

For detailed deployment instructions, see: [k8s/DEPLOYMENT_SUCCESS.md](k8s/DEPLOYMENT_SUCCESS.md)

For monitoring setup, see: [k8s/GRAFANA_QUICK_START.md](k8s/GRAFANA_QUICK_START.md)