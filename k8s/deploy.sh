#!/bin/bash

# Kubernetes Notes App Deployment Script
# This script deploys the complete notes application stack to Kubernetes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed or not in PATH"
    exit 1
fi

# Check if kubernetes cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

print_header "Deploying Notes App to Kubernetes"

# Check if we're in the right directory
if [ ! -d "k8s" ]; then
    print_error "k8s directory not found. Please run this script from the notes-app root directory."
    exit 1
fi

cd k8s

print_header "Step 1: Prerequisites Check"

# Check if metrics-server is available (required for HPA)
if ! kubectl get deployment metrics-server -n kube-system &> /dev/null; then
    print_warning "Metrics server not found. HPA may not work properly."
    echo "To install metrics server, run:"
    echo "kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml"
fi

# Check if ingress controller is available
if ! kubectl get pods -n ingress-nginx | grep -q "ingress-nginx-controller" &> /dev/null && \
   ! kubectl get pods -n kube-system | grep -q "nginx-ingress-controller" &> /dev/null; then
    print_warning "Nginx ingress controller not found. Ingress may not work properly."
    echo "To install nginx ingress controller:"
    echo "For minikube: minikube addons enable ingress"
    echo "For others: kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml"
fi

print_header "Step 2: Deploying Application Components"

# Deploy in order
components=(
    "00-namespace.yaml:Creating namespace and service account"
    "01-secrets.yaml:Creating secrets for database, JWT, and TLS"
    "02-postgres.yaml:Deploying PostgreSQL database"
    "03-auth-service.yaml:Deploying authentication service"
    "04-notes-service.yaml:Deploying notes API service"
    "05-frontend.yaml:Deploying frontend application"
    "06-ingress.yaml:Creating ingress and network policies"
    "07-prometheus.yaml:Deploying Prometheus monitoring"
    "08-grafana.yaml:Deploying Grafana dashboards"
    "09-alertmanager.yaml:Deploying Alertmanager"
)

for component in "${components[@]}"; do
    IFS=':' read -r file description <<< "$component"
    
    if [ -f "$file" ]; then
        print_status "$description..."
        if kubectl apply -f "$file"; then
            print_status "✓ $file deployed successfully"
        else
            print_error "✗ Failed to deploy $file"
            exit 1
        fi
    else
        print_warning "File $file not found, skipping..."
    fi
done

print_header "Step 3: Waiting for Deployments"

print_status "Waiting for pods to be ready..."

# Wait for namespace to be created
kubectl wait --for=condition=Ready --timeout=60s namespace/notes-app || true

# Wait for deployments to be ready
deployments=(
    "notes-app:postgres"
    "notes-app:auth-service"
    "notes-app:notes-service"
    "notes-app:frontend"
    "monitoring:prometheus"
    "notes-app:grafana"
    "notes-app:alertmanager"
)

for deployment in "${deployments[@]}"; do
    IFS=':' read -r namespace name <<< "$deployment"
    
    print_status "Waiting for $name deployment in $namespace namespace..."
    if kubectl wait --for=condition=Available --timeout=300s deployment/$name -n $namespace; then
        print_status "✓ $name is ready"
    else
        print_warning "⚠ $name deployment timeout, but continuing..."
    fi
done

print_header "Step 4: Deployment Information"

# Get ingress IP
print_status "Getting ingress information..."
if kubectl get ingress -n notes-app notes-app-ingress &> /dev/null; then
    kubectl get ingress -n notes-app notes-app-ingress
else
    print_warning "Ingress not found"
fi

print_header "Step 5: Setup Instructions"

echo ""
print_status "Deployment completed! Here's how to access your application:"
echo ""
echo "1. Add the following to your /etc/hosts file:"
echo "   For minikube: echo \"\$(minikube ip) notes.local\" | sudo tee -a /etc/hosts"
echo "   For Docker Desktop: echo \"127.0.0.1 notes.local\" | sudo tee -a /etc/hosts"
echo ""
echo "2. Access the application:"
echo "   - Frontend: https://notes.local"
echo "   - Auth API: https://notes.local/api/v1/auth"
echo "   - Notes API: https://notes.local/api/v1"
echo "   - Prometheus: https://notes.local/prometheus"
echo "   - Grafana: https://notes.local/grafana (admin/admin123)"
echo "   - Alertmanager: https://notes.local/alertmanager"
echo ""

print_header "Step 6: Verification Commands"

echo "Run these commands to verify your deployment:"
echo ""
echo "# Check pod status"
echo "kubectl get pods -n notes-app"
echo ""
echo "# Check services"
echo "kubectl get services -n notes-app"
echo ""
echo "# Check HPA status"
echo "kubectl get hpa -n notes-app"
echo ""
echo "# Check ingress"
echo "kubectl get ingress -n notes-app"
echo ""
echo "# View logs"
echo "kubectl logs -n notes-app -l app=auth-service"
echo "kubectl logs -n notes-app -l app=notes-service"
echo "kubectl logs -n notes-app -l app=frontend"
echo ""

print_status "Notes App deployment completed successfully! 🎉"

print_header "Troubleshooting"
echo "If you encounter issues:"
echo "1. Check pod logs: kubectl logs -n notes-app <pod-name>"
echo "2. Check pod status: kubectl describe pod -n notes-app <pod-name>"
echo "3. Check ingress: kubectl describe ingress -n notes-app notes-app-ingress"
echo "4. Verify secrets: kubectl get secrets -n notes-app"
echo ""
echo "For detailed troubleshooting, see the README.md file in the k8s directory."
