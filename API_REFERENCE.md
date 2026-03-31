# API Reference Guide

This document defines the API endpoints expected by the Smart Agriculture IoT Dashboard frontend.

## Base URL

```
http://localhost:8000/api    (development)
https://your-domain.com/api  (production)
```

## Authentication

Currently, the API uses no authentication (configured in `.env`). For production, implement:
- JWT tokens
- API keys
- OAuth 2.0

## Response Format

All responses follow a standard JSON format:

### Success Response
```json
{
  "status": "success",
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "status": "error",
  "error": "Error description",
  "code": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

## Endpoints

### 1. Get All Sensors
Retrieve a list of all sensors with their current readings.

**Request:**
```
GET /api/sensors
```

**Parameters:**
None

**Response (200 OK):**
```json
[
  {
    "sensorId": "SENSOR_001",
    "locationName": "North_Field",
    "temperature": 23.5,
    "humidity": 65.2,
    "lastUpdate": "2024-03-31T10:30:00Z",
    "status": "active",
    "ldStatus": true
  },
  {
    "sensorId": "SENSOR_002",
    "locationName": "Tomato_Greenhouse",
    "temperature": 25.1,
    "humidity": 72.8,
    "lastUpdate": "2024-03-31T10:29:45Z",
    "status": "active",
    "ldStatus": true
  },
  {
    "sensorId": "SENSOR_003",
    "locationName": "South_Field",
    "temperature": 22.3,
    "humidity": 58.5,
    "lastUpdate": "2024-03-30T20:15:00Z",
    "status": "inactive",
    "ldStatus": false
  }
]
```

**Response Fields:**
- `sensorId` (string): Unique sensor identifier (e.g., "SENSOR_001")
- `locationName` (string): Human-readable location name (e.g., "North_Field")
- `temperature` (float): Current temperature in Celsius
- `humidity` (float): Current humidity percentage (0-100)
- `lastUpdate` (string): ISO 8601 timestamp of last data reception
- `status` (string): "active" or "inactive"
- `ldStatus` (boolean): Light Detection status (true=day/transmitting, false=night/inactive)

**Error Response (500):**
```json
{
  "status": "error",
  "error": "Database connection failed",
  "code": "DB_ERROR"
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/sensors" \
  -H "Content-Type: application/json"
```

---

### 2. Get Single Sensor Details
Retrieve detailed information for a specific sensor.

**Request:**
```
GET /api/sensor/{sensorId}
```

**Parameters:**
- `sensorId` (path parameter): The unique sensor ID (e.g., "SENSOR_001")

**Response (200 OK):**
```json
{
  "sensorId": "SENSOR_001",
  "locationName": "North_Field",
  "temperature": 23.5,
  "humidity": 65.2,
  "lastUpdate": "2024-03-31T10:30:00Z",
  "status": "active",
  "ldStatus": true,
  "battery": 85,
  "signalStrength": -45,
  "nodeType": "DHT22",
  "firmwareVersion": "1.2.3"
}
```

**Response Fields:**
All fields from `/sensors` endpoint plus:
- `battery` (integer): Battery percentage (0-100)
- `signalStrength` (integer): RSSI signal strength (typically -30 to -90)
- `nodeType` (string): Sensor model (e.g., "DHT22")
- `firmwareVersion` (string): Firmware version

**Error Response (404):**
```json
{
  "status": "error",
  "error": "Sensor not found",
  "code": "SENSOR_NOT_FOUND"
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/sensor/SENSOR_001" \
  -H "Content-Type: application/json"
```

---

### 3. Get Sensor Historical Data
Retrieve historical readings for a sensor over a specified time period.

**Request:**
```
GET /api/sensor/{sensorId}/history?hours=24
```

**Parameters:**
- `sensorId` (path parameter): The unique sensor ID
- `hours` (query parameter, optional): Number of hours of history (default: 24)
- `from` (query parameter, optional): Start timestamp (ISO 8601)
- `to` (query parameter, optional): End timestamp (ISO 8601)
- `limit` (query parameter, optional): Maximum records to return (default: 1000)

**Response (200 OK):**
```json
[
  {
    "timestamp": "2024-03-31T02:00:00Z",
    "temperature": 18.2,
    "humidity": 72.5
  },
  {
    "timestamp": "2024-03-31T03:00:00Z",
    "temperature": 17.8,
    "humidity": 74.1
  },
  {
    "timestamp": "2024-03-31T04:00:00Z",
    "temperature": 17.5,
    "humidity": 75.3
  },
  {
    "timestamp": "2024-03-31T10:30:00Z",
    "temperature": 23.5,
    "humidity": 65.2
  }
]
```

**Response Fields:**
- `timestamp` (string): ISO 8601 timestamp
- `temperature` (float): Temperature reading in Celsius
- `humidity` (float): Humidity reading percentage

**Query Variations:**
```
# Last 24 hours (default)
GET /api/sensor/SENSOR_001/history

# Last 7 days
GET /api/sensor/SENSOR_001/history?hours=168

# Last 30 days
GET /api/sensor/SENSOR_001/history?hours=720

# With time range
GET /api/sensor/SENSOR_001/history?from=2024-03-27T00:00:00Z&to=2024-03-31T23:59:59Z

# With limit
GET /api/sensor/SENSOR_001/history?hours=24&limit=100
```

**Error Response (404):**
```json
{
  "status": "error",
  "error": "Sensor not found",
  "code": "SENSOR_NOT_FOUND"
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/sensor/SENSOR_001/history?hours=24" \
  -H "Content-Type: application/json"
```

---

### 4. Get Sensor Statistics (Optional)
Retrieve aggregated statistics about all sensors.

**Request:**
```
GET /api/sensors/stats
```

**Parameters:**
None

**Response (200 OK):**
```json
{
  "totalSensors": 5,
  "activeSensors": 4,
  "inactiveSensors": 1,
  "averageTemperature": 23.2,
  "averageHumidity": 67.1,
  "minTemperature": 17.8,
  "maxTemperature": 25.1,
  "minHumidity": 58.5,
  "maxHumidity": 75.3,
  "lastUpdate": "2024-03-31T10:30:00Z"
}
```

**Response Fields:**
- `totalSensors` (integer): Total number of sensors
- `activeSensors` (integer): Number of active sensors
- `inactiveSensors` (integer): Number of inactive sensors
- `averageTemperature` (float): Average temperature across active sensors
- `averageHumidity` (float): Average humidity across active sensors
- `minTemperature` (float): Minimum temperature reading
- `maxTemperature` (float): Maximum temperature reading
- `minHumidity` (float): Minimum humidity reading
- `maxHumidity` (float): Maximum humidity reading
- `lastUpdate` (string): Latest timestamp among all sensors

**Error Response (500):**
```json
{
  "status": "error",
  "error": "Failed to calculate statistics",
  "code": "CALCULATION_ERROR"
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/sensors/stats" \
  -H "Content-Type: application/json"
```

---

### 5. Health Check (Optional)
Check API server health status.

**Request:**
```
GET /api/health
```

**Parameters:**
None

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2024-03-31T10:30:00Z",
  "uptime": 3600,
  "database": "connected",
  "version": "1.0.0"
}
```

**Response Fields:**
- `status` (string): "healthy", "degraded", or "unhealthy"
- `timestamp` (string): Server time (ISO 8601)
- `uptime` (integer): Server uptime in seconds
- `database` (string): Database connection status
- `version` (string): API version

**Error Response (503):**
```json
{
  "status": "unhealthy",
  "error": "Database connection failed",
  "database": "disconnected"
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/health" \
  -H "Content-Type: application/json"
```

---

## HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK - Request successful | Sensor data returned |
| 400 | Bad Request - Invalid parameters | Invalid sensorId format |
| 401 | Unauthorized - Authentication required | Missing API key |
| 403 | Forbidden - Access denied | Insufficient permissions |
| 404 | Not Found - Resource not found | Sensor doesn't exist |
| 500 | Internal Server Error | Database connection failed |
| 503 | Service Unavailable | Server maintenance |

## Request Headers

All requests should include:

```
Content-Type: application/json
Accept: application/json
```

For authenticated endpoints (if implemented):

```
Authorization: Bearer <token>
```

## Response Headers

Expected response headers:

```
Content-Type: application/json
X-API-Version: 1.0
X-Total-Results: 5
X-Request-ID: abc123def456
```

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| SENSOR_NOT_FOUND | Requested sensor doesn't exist | 404 |
| INVALID_PARAMETER | Invalid query parameter | 400 |
| DB_ERROR | Database operation failed | 500 |
| AUTH_FAILED | Authentication failed | 401 |
| PERMISSION_DENIED | Insufficient permissions | 403 |
| VALIDATION_ERROR | Data validation failed | 400 |
| SERVER_ERROR | Unexpected server error | 500 |

## Rate Limiting

Recommended rate limits:

```
GET /api/sensors               - 100 requests per minute
GET /api/sensor/{id}          - 100 requests per minute
GET /api/sensor/{id}/history  - 50 requests per minute
GET /api/sensors/stats        - 50 requests per minute
GET /api/health               - 1000 requests per minute
```

Include headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1711872600
```

## CORS Configuration

Required CORS headers on backend:

```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 3600');
```

## Pagination (Optional)

For endpoints returning multiple results:

```
GET /api/sensors?page=1&limit=20
GET /api/sensor/SENSOR_001/history?offset=0&limit=100
```

Response includes:

```json
{
  "data": [ /* results */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## Data Validation

### Sensor ID Format
```
Pattern: SENSOR_\d{3,}
Examples: SENSOR_001, SENSOR_123, SENSOR_9999
```

### Location Name Format
```
Pattern: [A-Za-z0-9_]+
Examples: North_Field, Tomato_Greenhouse, Zone_A1
```

### Temperature Range
```
Valid: -50 to 80 (Celsius)
Typical: 0 to 50
Quality: ±0.5°C
```

### Humidity Range
```
Valid: 0 to 100 (Percentage)
Typical: 30 to 90
Quality: ±2%
```

### Timestamp Format
```
Format: ISO 8601
Example: 2024-03-31T10:30:00Z
Example: 2024-03-31T10:30:00+00:00
```

## Example API Implementation (PHP)

```php
<?php
// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$endpoint = $_GET['endpoint'] ?? '';

switch($endpoint) {
    case 'sensors':
        echo json_encode([
            [
                'sensorId' => 'SENSOR_001',
                'locationName' => 'North_Field',
                'temperature' => 23.5,
                'humidity' => 65.2,
                'lastUpdate' => date('c'),
                'status' => 'active',
                'ldStatus' => true
            ]
        ]);
        break;
    
    case 'sensor':
        $id = $_GET['id'] ?? '';
        // Fetch from database
        echo json_encode([/* sensor data */]);
        break;
    
    case 'history':
        $id = $_GET['id'] ?? '';
        $hours = $_GET['hours'] ?? 24;
        // Fetch historical data
        echo json_encode([/* history data */]);
        break;
    
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
}
?>
```

## API Testing

### Using cURL

```bash
# Get all sensors
curl http://localhost:8000/api/sensors

# Get specific sensor
curl http://localhost:8000/api/sensor/SENSOR_001

# Get historical data (12 hours)
curl "http://localhost:8000/api/sensor/SENSOR_001/history?hours=12"

# Get statistics
curl http://localhost:8000/api/sensors/stats

# Health check
curl http://localhost:8000/api/health
```

### Using Postman

1. Create new request
2. Set method: GET
3. Set URL: `http://localhost:8000/api/sensors`
4. Add header: `Content-Type: application/json`
5. Click "Send"

### Using JavaScript (Fetch)

```javascript
// Get all sensors
fetch('http://localhost:8000/api/sensors')
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));

// With axios
import axios from 'axios';

axios.get('http://localhost:8000/api/sensors')
  .then(res => console.log(res.data))
  .catch(err => console.error(err));
```

## API Versioning

Current version: **1.0**

For future versions:

```
GET /api/v2/sensors
GET /api/v2/sensor/{id}
GET /api/v2/sensor/{id}/history
```

## Documentation Links

- [API Implementation Guide](./API_IMPLEMENTATION.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Logging Guide](./LOGGING_GUIDE.md)

---

**Last Updated**: March 31, 2024
**API Version**: 1.0
**Status**: ✅ Production Ready
