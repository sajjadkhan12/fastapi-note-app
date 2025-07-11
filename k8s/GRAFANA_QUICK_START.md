# 🎯 Quick Grafana Data Visualization Guide

## ✅ Step 1: Access Grafana Dashboard

**Grafana is now configured with Prometheus as the data source!**

1. **Ensure port-forward is running:**
```bash
kubectl port-forward -n notes-app service/grafana-service 3000:3000
```

2. **Open Grafana:**
   - URL: http://localhost:3000/grafana/login
   - Username: `admin`
   - Password: `admin123`

## 🔗 Step 2: Verify Data Source (Already Configured!)

The Prometheus data source is now automatically configured! You can verify:

1. Go to **⚙️ Configuration → Data Sources**
2. You should see **"Prometheus"** listed as the default data source
3. Click on it to see the URL: `http://prometheus.monitoring.svc.cluster.local:9090`

## 📊 Step 3: Create Your First Panel - Easy Method

### Quick Dashboard Creation:

1. **Click the "+" icon** in left sidebar → **Dashboard**
2. **Click "Add new panel"**
3. **Copy and paste these ready-to-use queries:**

### **Panel 1: Container Memory Usage**
```promql
container_memory_working_set_bytes{namespace="notes-app", container!=""}
```
- **Panel Title**: "Memory Usage by Container"
- **Unit**: bytes (IEC)
- **Legend**: `{{container}} - {{pod}}`

### **Panel 2: Container CPU Usage**
```promql
rate(container_cpu_usage_seconds_total{namespace="notes-app", container!=""}[5m]) * 100
```
- **Panel Title**: "CPU Usage % by Container"
- **Unit**: percent (0-100)
- **Legend**: `{{container}}`

### **Panel 3: Pod Status**
```promql
count by (phase) (kube_pod_status_phase{namespace="notes-app"})
```
- **Panel Title**: "Pod Status Count"
- **Panel Type**: Stat
- **Legend**: `{{phase}} Pods`

### **Panel 4: Network I/O**
```promql
rate(container_network_receive_bytes_total{namespace="notes-app"}[5m])
```
- **Panel Title**: "Network Receive Rate"
- **Unit**: bytes/sec
- **Legend**: `{{container}} RX`

## 🎨 Step 4: Import Pre-built Dashboard

### Import Kubernetes Cluster Monitoring Dashboard:

1. **Click "+" → Import**
2. **Dashboard ID**: `315`
3. **Load**
4. **Select Prometheus data source**
5. **Import**

### Import Docker Container Dashboard:
1. **"+" → Import**
2. **Dashboard ID**: `893`
3. **Configure and Import**

## 🔍 Step 5: Useful Queries for Notes App

### **Application Health Monitoring:**

```promql
# Service uptime (1 = up, 0 = down)
up{kubernetes_namespace="notes-app"}

# Pod restart count in last hour
increase(kube_pod_container_status_restarts_total{namespace="notes-app"}[1h])

# Memory usage percentage
(container_memory_working_set_bytes{namespace="notes-app"} / container_spec_memory_limit_bytes) * 100

# Pods not in Running state
kube_pod_status_phase{namespace="notes-app", phase!="Running"}
```

### **Resource Monitoring:**

```promql
# Disk usage percentage
(container_fs_usage_bytes{namespace="notes-app"} / container_fs_limit_bytes) * 100

# Network errors
rate(container_network_receive_errors_total{namespace="notes-app"}[5m])

# CPU throttling
rate(container_cpu_cfs_throttled_periods_total{namespace="notes-app"}[5m])
```

## 🚨 Step 6: Set Up Alerts

### Memory Alert Example:
1. **Edit a memory panel**
2. **Go to "Alert" tab**
3. **Create Alert:**
   - **Condition**: Memory usage > 80%
   - **Evaluation**: Every 10s for 1m
   - **Message**: "High memory usage detected"

## ⏰ Step 7: Dashboard Settings

### **Auto-refresh:**
- Click refresh dropdown (top right)
- Select **"10s"** or **"30s"**

### **Time Range:**
- Click time picker (top right)
- Select **"Last 1 hour"** or custom range

### **Save Dashboard:**
- Click 💾 **Save** icon
- Name: "Notes App Monitoring"
- Save

## 🎯 Quick Test Queries

**Try these queries in Grafana to see immediate data:**

1. **Basic connectivity:**
```promql
up{kubernetes_namespace="notes-app"}
```

2. **Current memory usage:**
```promql
container_memory_working_set_bytes{namespace="notes-app", container!=""}
```

3. **Pod count:**
```promql
count(kube_pod_info{namespace="notes-app"})
```

## 📱 Step 8: Mobile-Friendly Dashboard

### Panel Options for Better Visualization:
- **Graph Style**: Lines with Fill opacity 10%
- **Legend**: Bottom, as Table
- **Colors**: Palette Classic
- **Null values**: Connected

## 🔧 Troubleshooting

### **No Data Showing?**
1. Check time range (use "Last 1 hour")
2. Verify query syntax
3. Check if metrics exist in Prometheus: http://localhost:9090

### **Data Source Error?**
```bash
# Test from Grafana pod
kubectl exec -n notes-app deployment/grafana -it -- wget -O- http://prometheus.monitoring.svc.cluster.local:9090/api/v1/label/__name__/values
```

## 🎉 Success! 

Your Grafana is now fully configured with:
- ✅ Prometheus data source automatically configured
- ✅ Access to all cluster and application metrics
- ✅ Ready for dashboard creation and alerts
- ✅ Real-time monitoring capabilities

**Next Steps:**
1. Create panels using the queries above
2. Import pre-built dashboards (ID: 315, 893)
3. Set up alerts for critical metrics
4. Explore the rich metrics available from your cluster

Happy monitoring! 📊🚀
