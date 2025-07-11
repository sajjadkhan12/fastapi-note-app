# Monitoring Stack Overview

## Prometheus-Based Monitoring Solution

We're using a **Prometheus-based monitoring stack** which provides comprehensive observability for our Notes App without the complexity of OpenTelemetry.

## Components

### 1. **Prometheus** - Metrics Collection & Storage
- **Purpose**: Collects metrics from all microservices
- **Access**: `https://notes.local/prometheus`
- **Features**:
  - Automatic service discovery
  - Time-series metrics storage
  - Built-in query language (PromQL)
  - Alerting rules

### 2. **Grafana** - Visualization Dashboard
- **Purpose**: Creates beautiful dashboards for metrics visualization
- **Access**: `https://notes.local/grafana`
- **Credentials**: admin/admin123
- **Features**:
  - Pre-configured dashboards for each service
  - Custom dashboards for business metrics
  - Alert visualization

### 3. **Alertmanager** - Alert Management
- **Purpose**: Handles alerts fired by Prometheus
- **Access**: `https://notes.local/alertmanager`
- **Features**:
  - Alert routing
  - Notification channels (email, Slack, etc.)
  - Alert deduplication and grouping

## Metrics Collected

### Application Metrics
- **HTTP Request Metrics**: Response times, status codes, request rates
- **Database Metrics**: Connection pool, query performance
- **Custom Business Metrics**: User registrations, note creation, etc.

### Infrastructure Metrics
- **Pod Metrics**: CPU, Memory usage
- **Node Metrics**: System-level resource usage
- **Network Metrics**: Service-to-service communication

## Auto-Scaling Integration

Our Horizontal Pod Autoscaler (HPA) uses Prometheus metrics:
- **CPU utilization** (primary metric)
- **Memory utilization** (secondary metric)
- **Custom metrics** (e.g., request rate per pod)

## Why Prometheus Instead of OpenTelemetry?

### Prometheus Advantages:
✅ **Simpler Setup**: Less configuration complexity
✅ **Battle-Tested**: Proven in production environments
✅ **Great Ecosystem**: Extensive integrations and exporters
✅ **Efficient Storage**: Optimized for time-series data
✅ **Built-in Alerting**: Native alerting capabilities

### When to Consider OpenTelemetry:
- Need for **distributed tracing** across microservices
- **Multi-vendor observability** requirements
- **Standardized telemetry** across different monitoring backends
- **Advanced correlation** between metrics, logs, and traces

## Getting Started

1. **Deploy the stack**:
   ```bash
   ./k8s/deploy.sh
   ```

2. **Access Grafana**:
   - URL: `https://notes.local/grafana`
   - Login: admin/admin123
   - Explore pre-built dashboards

3. **View Prometheus targets**:
   - URL: `https://notes.local/prometheus/targets`
   - Verify all services are being scraped

4. **Check alerts**:
   - URL: `https://notes.local/alertmanager`
   - Configure notification channels

## Dashboard Overview

### 1. **Application Overview Dashboard**
- Overall application health
- Request rates across all services
- Error rates and response times

### 2. **Auth Service Dashboard**
- Authentication requests
- User registration metrics
- JWT token validation performance

### 3. **Notes Service Dashboard**
- Note CRUD operations
- Category and tag usage
- Search performance

### 4. **Frontend Dashboard**
- Page load times
- User interaction metrics
- Client-side errors

### 5. **Infrastructure Dashboard**
- Pod resource usage
- Node-level metrics
- Network traffic

## Alerting Rules

Pre-configured alerts for:
- **High Error Rate**: >5% error rate for 5 minutes
- **High Response Time**: >1s average response time
- **Pod Down**: Any pod unavailable for 2 minutes
- **High CPU Usage**: >80% CPU usage for 10 minutes
- **High Memory Usage**: >85% memory usage for 10 minutes

## Security Features

- **TLS Encryption**: All monitoring traffic encrypted
- **Access Control**: Grafana authentication required
- **Network Policies**: Restricted communication between components
- **Secret Management**: All credentials stored in Kubernetes secrets

This monitoring setup provides excellent observability for our Notes App with minimal complexity!
