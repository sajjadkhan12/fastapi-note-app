#!/bin/bash

# Kubernetes Notes App Cleanup Script
# This script removes the complete notes application stack from Kubernetes

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

print_header "Cleaning up Notes App from Kubernetes"

# Ask for confirmation
echo ""
print_warning "This will delete the entire notes-app deployment including:"
echo "  - All pods, services, and deployments"
echo "  - Database and all data (PersistentVolumeClaims)"
echo "  - Secrets and configuration"
echo "  - Monitoring stack (Prometheus, Grafana, Alertmanager)"
echo ""
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Cleanup cancelled."
    exit 0
fi

print_header "Step 1: Removing Application Resources"

# Check if we're in the right directory
if [ ! -d "k8s" ]; then
    print_error "k8s directory not found. Please run this script from the notes-app root directory."
    exit 1
fi

cd k8s

# Remove in reverse order to avoid dependency issues
components=(
    "09-alertmanager.yaml:Removing Alertmanager"
    "08-grafana.yaml:Removing Grafana"
    "07-prometheus.yaml:Removing Prometheus monitoring"
    "06-ingress.yaml:Removing ingress and network policies"
    "05-frontend.yaml:Removing frontend application"
    "04-notes-service.yaml:Removing notes API service"
    "03-auth-service.yaml:Removing authentication service"
    "02-postgres.yaml:Removing PostgreSQL database"
    "01-secrets.yaml:Removing secrets"
    "00-namespace.yaml:Removing namespace and service account"
)

for component in "${components[@]}"; do
    IFS=':' read -r file description <<< "$component"
    
    if [ -f "$file" ]; then
        print_status "$description..."
        if kubectl delete -f "$file" --ignore-not-found=true; then
            print_status "✓ $file removed successfully"
        else
            print_warning "⚠ Issues removing $file, but continuing..."
        fi
    else
        print_warning "File $file not found, skipping..."
    fi
done

print_header "Step 2: Cleaning up Persistent Resources"

# Remove any remaining PVCs
print_status "Checking for remaining PersistentVolumeClaims..."
if kubectl get pvc -n notes-app &> /dev/null; then
    print_status "Removing PersistentVolumeClaims..."
    kubectl delete pvc --all -n notes-app --ignore-not-found=true
fi

# Remove any remaining PVs that might be stuck
print_status "Checking for stuck PersistentVolumes..."
if kubectl get pv | grep -q "notes-app" &> /dev/null; then
    print_warning "Some PersistentVolumes might still exist. You may need to clean them up manually:"
    kubectl get pv | grep "notes-app" || true
fi

print_header "Step 3: Final Cleanup"

# Force delete namespace if it's stuck
print_status "Ensuring namespace is completely removed..."
if kubectl get namespace notes-app &> /dev/null; then
    print_status "Waiting for namespace deletion..."
    kubectl delete namespace notes-app --ignore-not-found=true --timeout=60s || {
        print_warning "Namespace deletion timeout. Forcing deletion..."
        kubectl patch namespace notes-app -p '{"metadata":{"finalizers":[]}}' --type=merge || true
    }
fi

# Remove monitoring namespace if it was created by our script
if kubectl get namespace monitoring &> /dev/null; then
    # Check if this was created by our deployment (has our labels)
    if kubectl get namespace monitoring -o jsonpath='{.metadata.labels.name}' | grep -q "monitoring" &> /dev/null; then
        print_status "Removing monitoring namespace..."
        kubectl delete namespace monitoring --ignore-not-found=true
    else
        print_warning "Monitoring namespace exists but wasn't created by this deployment. Leaving it intact."
    fi
fi

print_header "Step 4: Verification"

print_status "Verifying cleanup..."

# Check if namespace still exists
if kubectl get namespace notes-app &> /dev/null; then
    print_warning "notes-app namespace still exists. It may take a moment to fully terminate."
else
    print_status "✓ notes-app namespace removed"
fi

# Check for any remaining resources
remaining_resources=$(kubectl get all --all-namespaces | grep "notes-app" | wc -l || echo "0")
if [ "$remaining_resources" -gt 0 ]; then
    print_warning "Some resources may still be terminating:"
    kubectl get all --all-namespaces | grep "notes-app" || true
else
    print_status "✓ No remaining resources found"
fi

print_header "Cleanup Summary"

echo ""
print_status "Notes App cleanup completed! 🧹"
echo ""
print_status "The following have been removed:"
echo "  ✓ All application pods and services"
echo "  ✓ Database and stored data"
echo "  ✓ Configuration secrets"
echo "  ✓ Monitoring stack"
echo "  ✓ Network policies and ingress"
echo ""

print_status "You may also want to:"
echo "  - Remove the notes.local entry from /etc/hosts"
echo "  - Clean up any local Docker images if no longer needed"
echo ""

print_status "Cleanup completed successfully! 👍"
