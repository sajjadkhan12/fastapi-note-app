# Kubernetes Deployment Guide for Notes App

This guide covers deploying the complete notes application stack to Kubernetes with:
- Secure HTTPS with TLS certificates
- Kubernetes secrets for sensitive data
- Monitoring with Prometheus
- Autoscaling with HPA
- Network security policies
- Persistent storage for PostgreSQL

## Prerequisites

1. **Kubernetes cluster** (minikube, Docker Desktop, or cloud provider)
2. **kubectl** configured to connect to your cluster
3. **Ingress controller** (nginx-ingress recommended)
4. **Metrics server** for HPA to work

### Setting up Prerequisites

```bash
# For minikube users
minikube start
minikube addons enable ingress
minikube addons enable metrics-server

# For Docker Desktop users
# Enable Kubernetes in Docker Desktop settings
# Install nginx-ingress
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Install metrics-server (for HPA)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

## Deployment Steps

### 1. Deploy the Application

Apply all manifests in order:

```bash
# Navigate to the k8s directory
cd k8s

# Apply all manifests in order
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-secrets.yaml
kubectl apply -f 02-postgres.yaml
kubectl apply -f 03-auth-service.yaml
kubectl apply -f 04-notes-service.yaml
kubectl apply -f 05-frontend.yaml
kubectl apply -f 06-ingress.yaml
kubectl apply -f 07-prometheus.yaml

# Or apply all at once
kubectl apply -f .
```

### 2. Configure Local HTTPS Access

For local development with HTTPS, add the domain to your hosts file:

```bash
# Get the ingress IP
kubectl get ingress -n notes-app

# For minikube
echo "$(minikube ip) notes.local" | sudo tee -a /etc/hosts

# For Docker Desktop or other local clusters
echo "127.0.0.1 notes.local" | sudo tee -a /etc/hosts
```

### 3. Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n notes-app

# Check services
kubectl get services -n notes-app

# Check ingress
kubectl get ingress -n notes-app

# Check HPA status
kubectl get hpa -n notes-app

# Check secrets
kubectl get secrets -n notes-app
```

### 4. Access the Application

- **Frontend**: https://notes.local
- **Auth API**: https://notes.local/auth
- **Notes API**: https://notes.local/api
- **Prometheus**: https://notes.local/prometheus

## Monitoring and Observability

### Prometheus Metrics

The deployment includes:
- Prometheus server for metrics collection
- ServiceMonitor for auto-discovery
- All services annotated for scraping
- PostgreSQL exporter for database metrics

Access Prometheus UI at: https://notes.local/prometheus

### Key Metrics to Monitor

- `http_requests_total` - HTTP request counts
- `http_request_duration_seconds` - Request latency
- `postgres_up` - Database availability
- `container_memory_usage_bytes` - Memory usage
- `container_cpu_usage_seconds_total` - CPU usage

### Grafana (Optional)

To add Grafana for better visualization:

```bash
kubectl apply -f 08-grafana.yaml  # (if created)
```

## Autoscaling

HPA (Horizontal Pod Autoscaler) is configured for:
- **Auth Service**: 2-10 replicas, scale on 70% CPU/memory
- **Notes Service**: 2-10 replicas, scale on 70% CPU/memory  
- **Frontend**: 2-8 replicas, scale on 70% CPU/memory

Monitor scaling:
```bash
kubectl get hpa -n notes-app -w
```

## Security Features

### Secrets Management
- Database credentials in `postgres-secret`
- JWT signing key in `jwt-secret`
- TLS certificate in `tls-secret`

### Network Security
- NetworkPolicy restricts pod-to-pod communication
- Ingress with TLS termination
- Security headers (HSTS, CSP, etc.)

### Pod Security
- Non-root containers
- Read-only root filesystems where possible
- Resource limits and requests
- Dedicated service account

## Troubleshooting

### Common Issues

1. **Pods not starting**:
   ```bash
   kubectl describe pods -n notes-app
   kubectl logs -n notes-app <pod-name>
   ```

2. **Database connection issues**:
   ```bash
   kubectl logs -n notes-app postgres-0
   kubectl exec -it -n notes-app postgres-0 -- psql -U notesuser -d notesdb
   ```

3. **Ingress not working**:
   ```bash
   kubectl describe ingress -n notes-app notes-ingress
   kubectl logs -n ingress-nginx controller-<pod-id>
   ```

4. **HPA not scaling**:
   ```bash
   kubectl describe hpa -n notes-app
   kubectl top pods -n notes-app
   ```

### Useful Commands

```bash
# Get all resources in namespace
kubectl get all -n notes-app

# Watch pod status
kubectl get pods -n notes-app -w

# Port forward for direct access
kubectl port-forward -n notes-app svc/frontend-service 3000:80
kubectl port-forward -n notes-app svc/auth-service 8001:8000
kubectl port-forward -n notes-app svc/notes-service 8002:8000

# View logs
kubectl logs -n notes-app -l app=auth-service -f
kubectl logs -n notes-app -l app=notes-service -f
kubectl logs -n notes-app -l app=frontend -f
```

## Cleanup

To remove the entire deployment:

```bash
kubectl delete namespace notes-app
```

Or remove specific components:

```bash
kubectl delete -f k8s/
```

## Production Considerations

1. **TLS Certificates**: Replace self-signed cert with proper CA-signed certificate
2. **Secrets**: Use external secret management (Vault, AWS Secrets Manager)
3. **Monitoring**: Add Alertmanager and Grafana for complete observability
4. **Logging**: Consider ELK stack or similar for centralized logging
5. **Backup**: Set up regular PostgreSQL backups
6. **RBAC**: Implement fine-grained role-based access control
7. **Pod Security Standards**: Enable Pod Security Standards/Policies
8. **Network Policies**: Implement more granular network restrictions
9. **Resource Management**: Fine-tune resource requests/limits based on load testing
10. **Multi-zone**: Deploy across multiple availability zones for HA
