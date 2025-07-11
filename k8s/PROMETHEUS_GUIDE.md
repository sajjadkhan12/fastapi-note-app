# Prometheus Data Visualization & Monitoring Guide

## 🎯 Accessing Prometheus Dashboard

1. **Ensure port-forward is running:**
```bash
kubectl port-forward -n monitoring service/prometheus 9090:9090
```

2. **Open Prometheus in your browser:**
   - http://localhost:9090/

## 📊 Key Metrics to Monitor for Your Notes App

### 1. Application Container Metrics

#### **CPU Usage by Container**
```promql
# CPU usage rate for all containers
rate(container_cpu_usage_seconds_total[5m])

# CPU usage for specific app containers
rate(container_cpu_usage_seconds_total{container=~"auth-service|notes-service|frontend"}[5m])
```

#### **Memory Usage**
```promql
# Memory usage by container
container_memory_usage_bytes{container=~"auth-service|notes-service|frontend"}

# Memory usage as percentage of limit
(container_memory_usage_bytes{container=~"auth-service|notes-service|frontend"} / container_spec_memory_limit_bytes) * 100
```

#### **Network Traffic**
```promql
# Network receive rate
rate(container_network_receive_bytes_total{container=~"auth-service|notes-service|frontend"}[5m])

# Network transmit rate  
rate(container_network_transmit_bytes_total{container=~"auth-service|notes-service|frontend"}[5m])
```

### 2. Kubernetes Pod Metrics

#### **Pod Status**
```promql
# Number of running pods by app
count by (app) (kube_pod_info{namespace="notes-app"})

# Pod restart counts
kube_pod_container_status_restarts_total{namespace="notes-app"}
```

#### **Pod Resource Requests vs Limits**
```promql
# CPU requests
kube_pod_container_resource_requests{namespace="notes-app", resource="cpu"}

# Memory requests
kube_pod_container_resource_requests{namespace="notes-app", resource="memory"}
```

### 3. Node-Level Metrics

#### **Node Resource Usage**
```promql
# Node CPU utilization
(1 - rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100

# Node memory utilization
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
```

### 4. Application-Specific Metrics

#### **HTTP Request Metrics** (if your apps expose them)
```promql
# HTTP request rate
rate(http_requests_total[5m])

# HTTP request duration
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

## 🔍 How to Use Prometheus Dashboard

### **Step 1: Navigate to Graph Tab**
- Open http://localhost:9090/
- Click on "Graph" tab (should be selected by default)

### **Step 2: Enter PromQL Queries**
In the query box, enter any of the queries above. For example:
```promql
container_memory_usage_bytes{container=~"auth-service|notes-service|frontend"}
```

### **Step 3: Visualize Data**
- Click "Execute" to run the query
- Switch between "Table" and "Graph" views
- Adjust time range using the time picker
- Use "Console" tab for raw metric values

### **Step 4: Create Alerts** (Optional)
- Go to "Alerts" tab to see configured alert rules
- Alerts are defined in the AlertManager configuration

## 📋 Useful PromQL Query Examples

### **Quick Health Check Queries**

1. **All running containers in notes-app namespace:**
```promql
container_last_seen{container=~"auth-service|notes-service|frontend|postgres"}
```

2. **Container restart events:**
```promql
increase(kube_pod_container_status_restarts_total{namespace="notes-app"}[1h])
```

3. **Pods not in running state:**
```promql
kube_pod_status_phase{namespace="notes-app", phase!="Running"}
```

4. **High memory usage containers (>80%):**
```promql
(container_memory_usage_bytes / container_spec_memory_limit_bytes) * 100 > 80
```

5. **High CPU usage containers (>80%):**
```promql
rate(container_cpu_usage_seconds_total[5m]) > 0.8
```

### **Trend Analysis Queries**

1. **Memory usage trend over last hour:**
```promql
container_memory_usage_bytes{container="auth-service"}[1h]
```

2. **Network traffic patterns:**
```promql
rate(container_network_receive_bytes_total{container="frontend"}[5m])
```

## 🎛️ Advanced Prometheus Features

### **1. Time Range Selection**
- Use the time picker at the top to select different time ranges
- Custom ranges: 5m, 15m, 1h, 6h, 12h, 1d, 7d

### **2. Query History**
- Prometheus saves your recent queries
- Use the dropdown arrow next to the query box

### **3. Export Data**
- Raw data: Use the "Table" view and copy values
- Graph: Right-click on graph to save as image

### **4. Query Functions**
```promql
# Average over time
avg_over_time(container_memory_usage_bytes[1h])

# Maximum value
max(container_memory_usage_bytes)

# Sum by label
sum by (container) (container_memory_usage_bytes)

# Rate of change
rate(container_cpu_usage_seconds_total[5m])
```

## 📊 Setting Up Custom Dashboards

While Prometheus has basic graphing, for better visualization:

1. **Use Grafana** (already installed):
```bash
kubectl port-forward -n notes-app service/grafana-service 3000:3000
```
Access: http://localhost:3000/grafana/login

2. **Grafana Benefits:**
   - Beautiful dashboards
   - Multiple panel types (graphs, gauges, tables)
   - Alerting integration
   - Dashboard sharing and templates

## 🔧 Troubleshooting Tips

### **No Data Showing?**
1. Check if metrics-server is running:
```bash
kubectl get pods -n kube-system | grep metrics-server
```

2. Verify Prometheus targets:
   - Go to http://localhost:9090/targets
   - Check if all targets are "UP"

3. Check Prometheus configuration:
   - Go to http://localhost:9090/config

### **Specific Metric Missing?**
1. Search for available metrics:
```promql
{__name__=~".*cpu.*"}
```

2. Check metric labels:
```promql
container_memory_usage_bytes{namespace="notes-app"}
```

## 🎯 Quick Start Monitoring Checklist

1. ✅ **Open Prometheus**: http://localhost:9090/
2. ✅ **Try basic query**: `container_memory_usage_bytes{namespace="notes-app"}`
3. ✅ **Check your pods**: `kube_pod_info{namespace="notes-app"}`
4. ✅ **Monitor CPU**: `rate(container_cpu_usage_seconds_total{namespace="notes-app"}[5m])`
5. ✅ **Set up Grafana**: http://localhost:3000/grafana/login (admin/admin123)

Your Prometheus setup is now ready for comprehensive monitoring! 🚀
