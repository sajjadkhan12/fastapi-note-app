# 📊 Complete Grafana Setup Guide for Notes App

## 🎯 Step 1: Access Grafana

### Start Grafana Port-Forward (if not running):
```bash
kubectl port-forward -n notes-app service/grafana-service 3000:3000
```

### Login to Grafana:
- **URL**: http://localhost:3000/grafana/login
- **Username**: `admin`
- **Password**: `admin123`

## 🔗 Step 2: Add Prometheus Data Source

### Method 1: Via Web Interface

1. **Navigate to Data Sources:**
   - Click the "⚙️ Configuration" (gear icon) in the left sidebar
   - Click "Data Sources"
   - Click "Add data source"

2. **Select Prometheus:**
   - Click on "Prometheus" from the list

3. **Configure Prometheus Connection:**
   - **Name**: `Prometheus`
   - **URL**: `http://prometheus.monitoring.svc.cluster.local:9090`
   - **Access**: `Server (default)`
   - **Scrape interval**: `15s`
   - **Query timeout**: `60s`
   - **HTTP Method**: `GET`

4. **Save & Test:**
   - Scroll down and click "Save & Test"
   - You should see a green message: "Data source is working"

### Method 2: Via Configuration (Alternative)

If the web interface doesn't work, we can configure it directly in the pod:

```bash
# Edit Grafana configuration
kubectl exec -n notes-app deployment/grafana -it -- /bin/sh

# Inside the pod, create datasource config
cat > /etc/grafana/provisioning/datasources/prometheus.yml << EOF
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    url: http://prometheus.monitoring.svc.cluster.local:9090
    access: proxy
    isDefault: true
    editable: true
EOF

# Restart Grafana
exit
kubectl rollout restart deployment/grafana -n notes-app
```

## 📈 Step 3: Create Your First Dashboard

### Create New Dashboard:
1. Click the "+" (plus) icon in the left sidebar
2. Select "Dashboard"
3. Click "Add new panel"

### Panel 1: Container Memory Usage

1. **Panel Settings:**
   - **Title**: "Container Memory Usage"
   - **Panel Type**: Time series

2. **Query (A):**
   ```promql
   container_memory_working_set_bytes{namespace="notes-app", container!=""}
   ```

3. **Legend:**
   ```
   {{container}} - {{pod}}
   ```

4. **Unit Settings:**
   - Go to "Field" tab on the right
   - **Unit**: `Data (IEC) → bytes(IEC)`
   - **Display name**: `Memory Usage`

5. **Visualization:**
   - **Graph style**: Lines
   - **Line width**: 1
   - **Fill opacity**: 10

6. **Click "Apply" to save the panel**

### Panel 2: CPU Usage Rate

1. **Add another panel** (click "Add panel" → "Add new panel")

2. **Panel Settings:**
   - **Title**: "Container CPU Usage Rate"
   - **Panel Type**: Time series

3. **Query (A):**
   ```promql
   rate(container_cpu_usage_seconds_total{namespace="notes-app", container!=""}[5m]) * 100
   ```

4. **Legend:**
   ```
   {{container}} - {{pod}}
   ```

5. **Unit Settings:**
   - **Unit**: `Misc → percent (0-100)`
   - **Min**: 0
   - **Max**: 100

6. **Click "Apply" to save**

### Panel 3: Pod Status Overview

1. **Add another panel**

2. **Panel Settings:**
   - **Title**: "Pod Status"
   - **Panel Type**: Stat

3. **Query (A):**
   ```promql
   count by (phase) (kube_pod_status_phase{namespace="notes-app"})
   ```

4. **Legend:**
   ```
   {{phase}} Pods
   ```

5. **Value options:**
   - **Show**: Last value
   - **Unit**: `Misc → short`

6. **Thresholds:**
   - Green: 1 (Running pods)
   - Red: 0 (Failed pods)

7. **Click "Apply"**

### Panel 4: Network I/O

1. **Add another panel**

2. **Panel Settings:**
   - **Title**: "Network I/O (Bytes/sec)"
   - **Panel Type**: Time series

3. **Query (A) - Received:**
   ```promql
   rate(container_network_receive_bytes_total{namespace="notes-app"}[5m])
   ```

4. **Query (B) - Transmitted:**
   ```promql
   rate(container_network_transmit_bytes_total{namespace="notes-app"}[5m])
   ```

5. **Legends:**
   - A: `{{container}} - RX`
   - B: `{{container}} - TX`

6. **Unit**: `Data rate → bytes/sec`

7. **Click "Apply"**

## 💾 Step 4: Save Your Dashboard

1. **Click the "💾 Save" icon** (top of the page)
2. **Dashboard name**: "Notes App Monitoring"
3. **Folder**: General (default)
4. **Click "Save"**

## 🎛️ Step 5: Dashboard Configuration

### Set Auto-Refresh:
1. Click the **refresh dropdown** (top right)
2. Select **"10s"** or **"30s"** for auto-refresh

### Set Time Range:
1. Click the **time picker** (top right)
2. Select **"Last 1 hour"** or your preferred range

### Add Variables (Advanced):
1. Go to **Dashboard Settings** (⚙️ icon near dashboard title)
2. Click **"Variables"**
3. Click **"New variable"**
4. **Name**: `container`
5. **Type**: Query
6. **Query**: `label_values(container_memory_working_set_bytes{namespace="notes-app"}, container)`
7. **Save**

## 📊 Step 6: Import Pre-built Dashboards

### Import Kubernetes Dashboard:
1. Click **"+" → "Import"**
2. **Dashboard ID**: `315`
3. **Load**
4. **Prometheus**: Select your Prometheus data source
5. **Import**

### Import Docker Dashboard:
1. **"+" → "Import"**
2. **Dashboard ID**: `893`
3. Configure data source
4. **Import**

## 🔍 Step 7: Useful Queries for Your Notes App

### Application Health Queries:

```promql
# Service uptime
up{kubernetes_namespace="notes-app"}

# Pod restart count
increase(kube_pod_container_status_restarts_total{namespace="notes-app"}[1h])

# Memory usage percentage
(container_memory_working_set_bytes{namespace="notes-app"} / container_spec_memory_limit_bytes) * 100

# High CPU usage alert
rate(container_cpu_usage_seconds_total{namespace="notes-app"}[5m]) > 0.8

# Pods not running
kube_pod_status_phase{namespace="notes-app", phase!="Running"}

# Network errors
rate(container_network_receive_errors_total{namespace="notes-app"}[5m])

# Disk usage
(container_fs_usage_bytes{namespace="notes-app"} / container_fs_limit_bytes) * 100
```

## 🚨 Step 8: Set Up Alerts (Optional)

### Create Alert Rule:
1. **Edit a panel** (click panel title → Edit)
2. Go to **"Alert"** tab
3. **Create Alert**
4. **Condition**: Set threshold (e.g., Memory > 80%)
5. **Evaluation**: Every 10s for 1m
6. **Notifications**: Configure email/Slack

## 🎨 Step 9: Dashboard Customization

### Panel Options:
- **Colors**: Customize line colors
- **Legends**: Show/hide, position
- **Axes**: Labels, units, min/max values
- **Overrides**: Per-series customization

### Dashboard Options:
- **Tags**: Organize dashboards
- **Links**: Add external links
- **Annotations**: Mark events
- **Variables**: Dynamic filtering

## 🔧 Troubleshooting

### Data Source Connection Issues:
1. **Check URL**: Should be `http://prometheus.monitoring.svc.cluster.local:9090`
2. **Test from Grafana pod**:
   ```bash
   kubectl exec -n notes-app deployment/grafana -it -- wget -qO- http://prometheus.monitoring.svc.cluster.local:9090/api/v1/label/__name__/values
   ```

### No Data in Panels:
1. **Check time range** - make sure it covers when your app was running
2. **Verify metrics exist** in Prometheus: http://localhost:9090
3. **Check namespace spelling** - should be `notes-app`

### Permission Issues:
```bash
# Check Grafana pod logs
kubectl logs -n notes-app deployment/grafana -f
```

## 🎯 Quick Success Test

After setup, this query should show data:
```promql
up{kubernetes_namespace="notes-app"}
```

Your Grafana dashboard is now ready for comprehensive monitoring! 🚀📊
