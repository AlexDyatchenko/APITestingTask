# K6 Load Testing with Grafana & InfluxDB

This project includes a complete setup for running k6 load tests and visualizing results in Grafana dashboards.

## 🚀 Quick Start

### 1. Start Grafana and InfluxDB

```bash
docker-compose up -d
```

This will start:

- **InfluxDB 1.8** on http://localhost:8086
- **Grafana** on http://localhost:3000
- **Chronograf** (InfluxDB UI) on http://localhost:8888

### 2. Access Grafana

Open your browser and navigate to:

- URL: http://localhost:3000
- Username: `admin`
- Password: `admin`

### 3. Access Chronograf (InfluxDB Web UI)

For a DBeaver-like interface to browse InfluxDB data:

- URL: http://localhost:8888
- No login required
- Select the **k6** database to browse measurements and data

### 4. Run k6 Tests with InfluxDB Output

```bash
# Run any k6 test and send metrics to InfluxDB
k6 run --out influxdb=http://localhost:8086/k6 k6/smoke.test1.js

# Or use the convenience script
./k6/run-with-grafana.sh smoke.test1.js
```

## 📊 Viewing Results in Grafana

1. Open Grafana at http://localhost:3000
2. Navigate to **Dashboards**
3. Look for the **k6 Load Testing Results** dashboard
4. The dashboard will automatically show data from your k6 tests

## 🎯 Dashboard Features

The k6 Load Testing Results dashboard (from Grafana.com ID: 2587) includes:

- **Request Rate**: Requests per second over time
- **Response Times**: Min, Max, P90, P95 percentiles
- **Error Rate**: Failed requests percentage
- **Virtual Users**: Active VUs during the test
- **Data Transfer**: Bytes sent/received
- **Heatmap**: Response time distribution

## 🔧 Configuration

### Docker Compose Services

- **InfluxDB**:
  - Port: 8086
  - Database: `k6`
  - No authentication required

- **Grafana**:
  - Port: 3000
  - Admin credentials: admin/admin
  - Anonymous access enabled (Admin role)

### Grafana Provisioning

The following are automatically configured:

1. **Datasource**: InfluxDB connection in [grafana/provisioning/datasources/influxdb.yml](grafana/provisioning/datasources/influxdb.yml)
2. **Dashboard**: k6 dashboard in [grafana/dashboards/k6-dashboard.json](grafana/dashboards/k6-dashboard.json)

## 📝 Available k6 Tests

Run any of these tests with InfluxDB output:

```bash
# Smoke test (1 VU, 2s)
k6 run --out influxdb=http://localhost:8086/k6 k6/smoke.test1.js

# Load test
k6 run --out influxdb=http://localhost:8086/k6 k6/load.test.js

# Stress test
k6 run --out influxdb=http://localhost:8086/k6 k6/stress.test.js

# Spike test
k6 run --out influxdb=http://localhost:8086/k6 k6/spike.test.js

# Soak test
k6 run --out influxdb=http://localhost:8086/k6 k6/soak.test.js
```

## 🛠️ Management Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop services and remove volumes (clears all data)
docker-compose down -v

# Check service status
docker-compose ps
```

## 🔍 Troubleshooting

### Port Already in Use

If port 8086 or 3000 is already in use:

```bash
# Check what's using port 8086
sudo lsof -i:8086

# Stop system InfluxDB if needed
sudo systemctl stop influxdb
```

### Dashboard Not Showing Data

1. Verify InfluxDB is running: `docker-compose ps`
2. Check that k6 test ran with `--out influxdb=http://localhost:8086/k6`
3. Verify the database was created:
   ```bash
   docker exec -it k6-influxdb influx -execute 'SHOW DATABASES'
   ```
4. Refresh the Grafana dashboard

### Viewing InfluxDB Data

```bash
# Connect to InfluxDB
docker exec -it k6-influxdb influx

# Inside InfluxDB shell
> USE k6
> SHOW MEASUREMENTS
> SELECT * FROM http_reqs LIMIT 10
```

## 📚 Resources

- [k6 Documentation](https://k6.io/docs/)
- [InfluxDB + Grafana Setup Guide](https://k6.io/docs/results-output/real-time/influxdb-grafana/)
- [Grafana Dashboard: k6 Load Testing Results](https://grafana.com/grafana/dashboards/2587)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🏗️ Architecture

```
┌─────────────┐
│   k6 Test   │
└──────┬──────┘
       │ metrics
       ▼
┌─────────────┐      ┌──────────────┐
│  InfluxDB   │◄─────┤   Grafana    │
│   :8086     │      │    :3000     │
└─────────────┘      └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Browser    │
                     └──────────────┘
```

## 🎨 Customization

### Add Custom Dashboards

1. Create/export dashboard JSON from Grafana
2. Save to `grafana/dashboards/`
3. Restart Grafana: `docker-compose restart grafana`

### Modify InfluxDB Settings

Edit [docker-compose.yml](docker-compose.yml) and update the `influxdb` service environment variables.

## 🔐 Security Note

⚠️ This setup is for **development/testing only**. For production:

1. Enable authentication on InfluxDB
2. Use strong passwords for Grafana
3. Disable anonymous access in Grafana
4. Use HTTPS/TLS
5. Restrict network access
