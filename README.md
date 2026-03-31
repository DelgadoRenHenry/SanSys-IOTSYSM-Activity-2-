# Smart Agriculture IoT Dashboard - Frontend

**Group Members**: 
- Ren Henry Delgado 
- Jerwin James Bueno 
- Mohasien Alingan
- Fracie Princes Puyot 
- John Ashley Sitchon 

---

## 📌 Project Overview

A comprehensive React-based frontend dashboard for monitoring environmental conditions in a smart farming system using IoT sensors with Star Topology Network architecture. The system allows farm managers to efficiently monitor temperature and humidity readings from multiple sensor nodes across different farm locations.

## 🌟 Key Features

### Dashboard Overview
- **Summary Cards**: Display total active sensors, inactive sensors, and average environmental conditions
- **Real-time Statistics**: Automatically calculated based on sensor data
- **Auto-refresh Capability**: Fetch new data every 5-10 seconds (configurable)
- **Manual Refresh**: Ability to manually refresh sensor data on demand

### Sensor Data Table
- **Comprehensive Display**: Shows Sensor ID, Location, Temperature, Humidity, Last Update timestamp
- **Search Functionality**: Search sensors by location name or sensor ID
- **Advanced Filtering**: Filter by sensor status (Active/Inactive/All)
- **Dynamic Sorting**: Sort by any column (temperature, humidity, timestamp, location)
- **Interactive Rows**: Click on any row to view detailed sensor information
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Sensor Detail View
- **Detailed Information Modal**: Shows comprehensive sensor data
- **Historical Data**: Displays the last 24 hours of sensor readings
- **Real-time Charts**: Line charts showing temperature and humidity trends
- **Light Detection Status**: Shows whether sensor is in daytime (transmitting) or nighttime (inactive)
- **Timestamp Information**: Displays both absolute and relative timestamps

### Data Visualization
- **Temperature Trends**: Line chart showing temperature over the last 24 hours
- **Humidity Trends**: Line chart showing humidity variations
- **Color-coded Indicators**: Green for active, red for inactive sensors
- **Interactive Tooltips**: Hover over chart points for exact values

### Status Management
- **Active/Inactive Status**: Determined based on last data reception time (default 1 minute threshold)
- **Edge Computing Awareness**: Recognizes nighttime operation (LDR/light detection)
- **Visual Indicators**: Pulsing green dot for active, static red for inactive
- **Status Badges**: Clear visual distinction of sensor operational state

### 📝 Comprehensive Logging System
- **Automatic Logging**: All operations logged with timestamp and level
- **Local Storage**: Logs persisted in browser's localStorage
- **Log Levels**: INFO, ERROR, WARN, DEBUG, SUCCESS
- **Export Capability**: Download logs as JSON file for analysis
- **In-memory Limit**: Keeps only the 1000 most recent logs

## 🛠️ Tech Stack

- **React 18**: Modern UI component framework with hooks
- **Axios**: HTTP client for API communication
- **Recharts**: Data visualization library for charts
- **Bootstrap 5**: Responsive UI framework
- **React Bootstrap**: Bootstrap components for React
- **Date-fns**: Date formatting and manipulation
- **Font Awesome**: Icon library
- **CSS3**: Custom styling with animations

## 📁 Project Structure

```
SanSys-IOTSYSM-Activity-2-/
├── public/
│   └── index.html                 # HTML template
├── src/
│   ├── components/
│   │   ├── Dashboard.js           # Main dashboard component
│   │   ├── SensorDataTable.js     # Sensor table with search/filter/sort
│   │   ├── SensorDetailModal.js   # Detailed sensor view modal
│   │   ├── SensorCharts.js        # Data visualization with Recharts
│   │   └── StatusIndicator.js     # Status badge component
│   ├── services/
│   │   ├── apiService.js          # API communication layer with axios
│   │   └── logger.js              # Comprehensive logging service
│   ├── utils/
│   │   └── helpers.js             # Utility functions (format, sort, filter)
│   ├── App.js                     # Main app component
│   ├── App.css                    # App-specific styles
│   ├── index.js                   # React entry point
│   └── index.css                  # Global styles
├── .env.example                   # Environment configuration template
├── .gitignore                     # Git ignore file
├── package.json                   # Dependencies and npm scripts
└── README.md                      # This file
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Backend API server (PHP/MySQL) running and accessible

### Step 1: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and set your backend API URL
# REACT_APP_API_URL=http://localhost:8000/api
```

### Step 3: Start Development Server

```bash
npm start
# or
yarn start
```

The application will open at `http://localhost:3000`

### Step 4: Build for Production

```bash
npm run build
# or
yarn build
```

## 🔌 API Integration

### Expected API Endpoints

The dashboard expects the following REST API endpoints from your backend:

#### 1. Get All Sensors
```
GET /api/sensors
Response:
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
  ...
]
```

#### 2. Get Single Sensor Details
```
GET /api/sensor/{sensorId}
```

#### 3. Get Sensor Historical Data
```
GET /api/sensor/{sensorId}/history?hours=24
```

## 📊 System Architecture

### Star Topology Configuration
```
                    Backend Server
                    (PHP + MySQL)
                           |
                           |
        _________________________________________
        |         |         |         |         |
     SENSOR    SENSOR    SENSOR    SENSOR    SENSOR
     Temp/H    Temp/H    Temp/H    Temp/H    Temp/H
     LDR        LDR       LDR       LDR       LDR
     (Day)      (Night)   (Day)     (Day)     (Night)
```

### Data Flow
1. Arduino sensors → Backend REST API
2. Frontend polls API every 5-10 seconds
3. Dashboard displays real-time data
4. Status updated based on last transmission timestamp
5. All interactions logged to browser storage

## 📋 Logging

The system includes a comprehensive logging service that records all operations:

```javascript
import { logger } from './services/logger';

// Log different levels
logger.info('Operation completed', { data });
logger.error('Error occurred', { error });
logger.warn('Warning message', { data });
logger.debug('Debug information', { data });
logger.success('Success message', { data });

// Retrieve logs
const recentLogs = logger.getLogs(100);

// Export logs
logger.exportLogs();

// Clear logs
logger.clearLogs();
```

**All logs include**:
- Timestamp (ISO format)
- Log level
- Message
- Additional data
- Unique ID

**Logs are stored in**:
- Browser console (real-time)
- Browser localStorage (persistent)
- Can be exported as JSON

## 🎨 Dashboard Components

### Dashboard.js
Main container component that manages:
- Sensor data fetching
- Auto-refresh logic
- Summary statistics
- Component orchestration

### SensorDataTable.js
Displays sensor data with:
- Search by location/ID
- Filter by status
- Sortable columns
- Click-to-detail functionality

### SensorDetailModal.js
Shows detailed view with:
- Full sensor information
- Historical charts
- Status details
- Refresh capability

### SensorCharts.js
Data visualization using Recharts:
- Temperature trend line chart
- Humidity trend line chart
- Interactive tooltips
- Responsive sizing

### StatusIndicator.js
Visual status component:
- Active (green, pulsing)
- Inactive (red, static)
- Animated badge

## 🔧 Key Functions

### Search & Filter
```javascript
// Debounced search (300ms delay)
searchSensors(sensors, searchTerm);

// Status filtering
filterSensorsByStatus(sensors, status);

// Sorting
sortSensorData(data, sortBy, sortOrder);
```

### Status Detection
```javascript
// Determines if sensor is active based on timestamp
isSensorActive(lastUpdateTime, thresholdMinutes = 1);
```

### Data Formatting
```javascript
formatTimestamp(timestamp);      // Human-readable format
formatTemperature(temp);         // 1 decimal place
formatHumidity(humidity);        // With % sign
getRelativeTime(timestamp);      // "2 minutes ago"
```

## 🐛 Error Handling

The system handles errors gracefully:
- API failures display user-friendly messages
- Mock data used as fallback
- All errors logged with full details
- Network timeouts handled automatically
- Invalid data validated before display

## 📱 Responsive Design

- **Desktop**: Full featured layout
- **Tablet**: Optimized column widths
- **Mobile**: Stacked layout with horizontal scroll
- **Touch-friendly**: Larger buttons and touch targets

## 🔐 Security Features

- CORS-enabled API communication
- Input validation on all data
- No sensitive data in logs
- HTTPS recommended for production
- Error handling without exposing internals

## 📈 Performance

- Debounced search (300ms)
- Efficient re-renders with React hooks
- Lazy-loaded charts on demand
- Optimized localStorage usage
- Minimal API calls with auto-refresh interval

## 🎯 Configuration

### Adjust Refresh Interval
Edit `src/components/Dashboard.js`:
```javascript
const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds
```

### Change Inactive Threshold
Edit `src/utils/helpers.js`:
```javascript
export const isSensorActive = (lastUpdateTime, thresholdMinutes = 1) => {
  // Modify thresholdMinutes to adjust when sensors are marked inactive
}
```

### Customize API URL
Edit `.env`:
```
REACT_APP_API_URL=http://your-backend-url/api
```

## 📚 Required Backend API Response Format

Each sensor object must include:
```json
{
  "sensorId": "SENSOR_001",          // Unique identifier
  "locationName": "North_Field",     // Location description
  "temperature": 23.5,               // Celsius
  "humidity": 65.2,                  // Percentage (0-100)
  "lastUpdate": "2024-03-31T10:30:00Z",  // ISO 8601 timestamp
  "status": "active",                // "active" or "inactive"
  "ldStatus": true                   // Light Detection (day/night)
}
```

## ✅ Testing Checklist

- [ ] Dashboard loads without errors
- [ ] Data fetches from API
- [ ] Auto-refresh works correctly
- [ ] Search functionality works
- [ ] Filter by status works
- [ ] Sorting works on all columns
- [ ] Detail modal opens on row click
- [ ] Charts display historical data
- [ ] Logs are saved to localStorage
- [ ] Responsive on mobile devices
- [ ] API errors handled gracefully
- [ ] Mock data displays when API unavailable

## 🚨 Troubleshooting

### No data displaying
1. Check if API is running on configured URL
2. Verify API returns correct data format
3. Check browser console for errors
4. Confirm CORS is enabled on backend
5. Try using mock data by removing API URL

### Auto-refresh not working
1. Check network tab in DevTools
2. Verify API is responding
3. Check browser console for JavaScript errors
4. Try manual refresh button
5. Check refreshInterval configuration

### Charts not showing
1. Verify historical data is available
2. Check for JavaScript errors in console
3. Try clicking manually to load chart
4. Verify data format from API

### Logs not saving
1. Check if localStorage is enabled
2. Verify browser privacy settings
3. Check available storage space
4. Try clearing localStorage cache
5. Check for localStorage permission errors

## 📞 Support

For issues or questions:
1. Check browser console (F12 → Console)
2. Review network requests (F12 → Network)
3. Export logs for analysis
4. Check API responses
5. Verify environment configuration

## 📝 License

Developed for the Smart Agriculture IoT System project.

---

**Last Updated**: March 31, 2024
**Version**: 1.0.0
**Status**: ✅ Production Ready