# Monitoring Dashboard Access

The monitoring dashboards (Prometheus, Grafana, Alertmanager) have been removed from the main nginx ingress to avoid routing conflicts. Instead, access them directly using port-forwarding.

## Access Methods

### 1. Grafana Dashboard (Recommended)
```bash
# Port-forward Grafana service to local port 3000
kubectl port-forward -n notes-app service/grafana-service 3000:3000

# Then access in browser:
# http://localhost:3000
# Login: admin / admin123 (or change password on first login)
```

### 2. Prometheus Dashboard
```bash
# Port-forward Prometheus service to local port 9090
kubectl port-forward -n notes-app service/prometheus-service 9090:9090

# Then access in browser:
# http://localhost:9090
```

### 3. Alertmanager Dashboard
```bash
# Port-forward Alertmanager service to local port 9093
kubectl port-forward -n notes-app service/alertmanager-service 9093:9093

# Then access in browser:
# http://localhost:9093
```

## Quick Start Commands

Run these commands in separate terminal windows/tabs to access all monitoring dashboards:

```bash
# Terminal 1 - Grafana
kubectl port-forward -n notes-app service/grafana-service 3000:3000

# Terminal 2 - Prometheus  
kubectl port-forward -n notes-app service/prometheus-service 9090:9090

# Terminal 3 - Alertmanager
kubectl port-forward -n notes-app service/alertmanager-service 9093:9093
```

## Benefits of Direct Access

1. **No routing conflicts** - Monitoring tools work as designed
2. **Better security** - Dashboards not exposed through public ingress
3. **Native functionality** - All features work without path rewriting issues
4. **Simpler configuration** - No complex nginx annotations needed

## Main Application Access

The main notes application remains accessible via HTTPS ingress:
- **Frontend**: https://notes.local/
- **Auth API**: https://notes.local/api/v1/auth/
- **Notes API**: https://notes.local/api/v1/

## Note

Port-forwarding creates a secure tunnel from your local machine to the Kubernetes cluster. The monitoring dashboards will only be accessible from your local machine while the port-forward commands are running.
