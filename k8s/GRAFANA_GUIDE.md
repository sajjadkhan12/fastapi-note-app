# Grafana Dashboard Setup for Notes App

## 🎯 Quick Grafana Access

1. **Start Grafana:**
```bash
kubectl port-forward -n notes-app service/grafana-service 3000:3000
```

2. **Login:**
   - URL: http://localhost:3000/grafana/login
   - Username: `admin`
   - Password: `admin123`

## 📊 Creating Your First Dashboard

### Step 1: Create New Dashboard
1. Click the "+" icon in the left sidebar
2. Select "Dashboard"
3. Click "Add new panel"

### Step 2: Add Memory Usage Panel
1. **Panel Title**: "Container Memory Usage"
2. **Query**: 
```promql
container_memory_usage_bytes{namespace="notes-app", container!=""}
```
3. **Legend**: `{{container}}`
4. **Unit**: bytes (IEC)
5. **Panel Type**: Time series

### Step 3: Add CPU Usage Panel
1. **Panel Title**: "Container CPU Usage Rate"
2. **Query**:
```promql
rate(container_cpu_usage_seconds_total{namespace="notes-app", container!=""}[5m])
```
3. **Legend**: `{{container}}`
4. **Unit**: percent (0.0-1.0)
5. **Panel Type**: Time series

### Step 4: Add Pod Status Panel
1. **Panel Title**: "Pod Status"
2. **Query**:
```promql
kube_pod_status_phase{namespace="notes-app"}
```
3. **Legend**: `{{pod}} - {{phase}}`
4. **Panel Type**: Stat

### Step 5: Add Network Traffic Panel
1. **Panel Title**: "Network I/O"
2. **Queries**:
   - A: `rate(container_network_receive_bytes_total{namespace="notes-app"}[5m])`
   - B: `rate(container_network_transmit_bytes_total{namespace="notes-app"}[5m])`
3. **Legend**: 
   - A: `{{container}} - Received`
   - B: `{{container}} - Transmitted`
4. **Unit**: bytes/sec
5. **Panel Type**: Time series

## 📋 Useful Grafana Tips

### **Time Range Selection**
- Use the time picker in the top-right
- Common ranges: Last 5m, 15m, 1h, 6h, 12h, 1d

### **Refresh Rate**
- Set auto-refresh: 5s, 10s, 30s, 1m
- Use "Live" for real-time updates

### **Variables (Advanced)**
Create dashboard variables for dynamic filtering:

1. **Go to Dashboard Settings → Variables**
2. **Add variable:**
   - Name: `container`
   - Type: Query
   - Query: `label_values(container_memory_usage_bytes{namespace="notes-app"}, container)`
3. **Use in queries:** `container_memory_usage_bytes{namespace="notes-app", container="$container"}`

### **Alerts (Advanced)**
1. Click on panel title → Edit
2. Go to "Alert" tab  
3. Create alert rules based on thresholds
4. Configure notification channels

## 🎨 Pre-built Dashboard Import

### Option 1: Import Kubernetes Dashboard
1. Go to "+" → Import
2. Dashboard ID: `315` (Kubernetes cluster monitoring)
3. Configure Prometheus data source
4. Import

### Option 2: Import Container Dashboard  
1. Go to "+" → Import
2. Dashboard ID: `893` (Docker and container monitoring)
3. Configure Prometheus data source
4. Import

## 🔍 Exploring Your Data

### **Real-time Monitoring:**
```promql
# Current memory usage by container
container_memory_usage_bytes{namespace="notes-app", container!=""}

# Current CPU usage percentage
rate(container_cpu_usage_seconds_total{namespace="notes-app", container!=""}[5m]) * 100

# Pod restart count
kube_pod_container_status_restarts_total{namespace="notes-app"}

# Network activity
rate(container_network_receive_bytes_total{namespace="notes-app"}[5m])
```

### **Troubleshooting Queries:**
```promql
# Containers using >90% memory
(container_memory_usage_bytes{namespace="notes-app"} / container_spec_memory_limit_bytes) > 0.9

# High CPU usage containers
rate(container_cpu_usage_seconds_total{namespace="notes-app"}[5m]) > 0.8

# Pods not running
kube_pod_status_phase{namespace="notes-app", phase!="Running"} == 1

# Recent pod restarts
increase(kube_pod_container_status_restarts_total{namespace="notes-app"}[30m]) > 0
```

## 📈 Advanced Visualization

### **Heatmaps**
Great for showing resource usage distribution over time
- Panel Type: Heatmap
- Query: `container_memory_usage_bytes{namespace="notes-app"}`

### **Gauge Panels**
Perfect for current resource utilization
- Panel Type: Gauge
- Query: `(container_memory_usage_bytes{namespace="notes-app"} / container_spec_memory_limit_bytes) * 100`
- Min: 0, Max: 100

### **Table Panels**
Useful for current status overview
- Panel Type: Table
- Query: `kube_pod_info{namespace="notes-app"}`
- Transform: Last (not null)

Your Grafana setup is ready for beautiful, real-time monitoring dashboards! 🎨📊
