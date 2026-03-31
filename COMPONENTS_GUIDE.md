# Component Documentation

Detailed documentation for all React components in the Smart Agriculture IoT Dashboard.

## Table of Contents

1. [Dashboard.js](#dashboardjs)
2. [SensorDataTable.js](#sensordatatablejs)
3. [SensorDetailModal.js](#sensordetailmodaljs)
4. [SensorCharts.js](#sensorchartsjs)
5. [StatusIndicator.js](#statusindicatorjs)

---

## Dashboard.js

**Location:** `src/components/Dashboard.js`

**Purpose:** Main dashboard container component that orchestrates all data fetching and displays summary statistics.

### Features

- Fetches sensor data from API
- Calculates and displays statistics
- Implements auto-refresh logic
- Manages sensor detail modal
- Displays summary cards
- Handles error states

### Props

None - This is the root component.

### State

```javascript
const [sensors, setSensors] = useState([]);              // All sensor data
const [loading, setLoading] = useState(true);           // Loading state
const [error, setError] = useState(null);               // Error message
const [selectedSensor, setSelectedSensor] = useState(null); // Selected sensor
const [showDetailModal, setShowDetailModal] = useState(false); // Modal visibility
const [stats, setStats] = useState({...});              // Statistics
const [lastRefresh, setLastRefresh] = useState(null);   // Last refresh time
const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true); // Auto-refresh toggle
const [refreshInterval, setRefreshInterval] = useState(5000); // Refresh interval
```

### Key Methods

#### `fetchSensors()`
- Fetches sensor data from API
- Calculates statistics
- Sets error message if failed
- Uses mock data as fallback

```javascript
const fetchSensors = async () => {
  try {
    const data = await sensorAPI.getAllSensors();
    setSensors(data);
    calculateStats(data);
    setError(null);
  } catch (err) {
    // Handle error
  }
};
```

#### `calculateStats(data)`
- Counts total, active, and inactive sensors
- Updates statistics state
- Logs calculation details

```javascript
const calculateStats = (data) => {
  const activeSensors = data.filter(s => isSensorActive(s.lastUpdate)).length;
  const inactiveSensors = data.length - activeSensors;
  
  setStats({
    totalSensors: data.length,
    activeSensors,
    inactiveSensors,
  });
};
```

#### `getLatestReadings()`
- Calculates average temperature and humidity
- Based on active sensors only
- Returns formatted strings

```javascript
const getLatestReadings = () => {
  const activeSens = sensors.filter(s => isSensorActive(s.lastUpdate));
  if (activeSens.length === 0) return { temp: 'N/A', humidity: 'N/A' };
  
  const avgTemp = activeSens.reduce((sum, s) => sum + s.temperature, 0) / activeSens.length;
  return { temp: avgTemp.toFixed(1), humidity: avgHumidity.toFixed(1) };
};
```

### Effects

#### Data Fetching ([] dependency)
- Runs once on component mount
- Initializes dashboard
- Logs application start

```javascript
useEffect(() => {
  fetchSensors();
  logger.info('Dashboard initialized');
}, []);
```

#### Auto-refresh (refreshInterval dependency)
- Runs every `refreshInterval` milliseconds
- Only if auto-refresh is enabled
- Automatically fetches new data

```javascript
useEffect(() => {
  if (!autoRefreshEnabled) return;
  
  const intervalId = setInterval(() => {
    fetchSensors();
  }, refreshInterval);
  
  return () => clearInterval(intervalId);
}, [autoRefreshEnabled, refreshInterval]);
```

### Usage Example

```javascript
import Dashboard from './components/Dashboard';

function App() {
  return <Dashboard />;
}
```

### Styling

Uses Bootstrap grid system:
- Container fluid for responsive layout
- Row/Col for responsive grid
- Custom CSS for gradients and animations

---

## SensorDataTable.js

**Location:** `src/components/SensorDataTable.js`

**Purpose:** Displays sensor data in a table with search, filter, and sort functionality.

### Features

- Sortable columns
- Real-time search (debounced)
- Status filtering
- Clickable rows for detail view
- Responsive table layout
- Visual sorting indicators

### Props

```javascript
{
  sensors: Array,           // Array of sensor objects
  loading: Boolean,         // Loading state
  onRowClick: Function      // Callback when row clicked
}
```

### State

```javascript
const [filteredSensors, setFilteredSensors] = useState(sensors);
const [searchTerm, setSearchTerm] = useState('');
const [statusFilter, setStatusFilter] = useState('all');
const [sortBy, setSortBy] = useState('location');
const [sortOrder, setSortOrder] = useState('asc');
```

### Key Methods

#### `handleSort(column)`
- Toggles sort order for a column
- Changes column if different from current
- Logs sort action

```javascript
const handleSort = (column) => {
  if (sortBy === column) {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  } else {
    setSortBy(column);
    setSortOrder('asc');
  }
};
```

#### `getSortIcon(column)`
- Returns visual indicator for sort direction
- Up arrow (↑) for ascending
- Down arrow (↓) for descending
- Bidirectional arrows (⇅) for unsorted

```javascript
const getSortIcon = (column) => {
  if (sortBy !== column) return '⇅';
  return sortOrder === 'asc' ? '↑' : '↓';
};
```

### Effects

#### Filtering, Sorting, and Searching (dependency array)
- Debounced 300ms to prevent excessive processing
- Applies all filters in sequence
- Updates displayed sensors

```javascript
useEffect(() => {
  debouncedSearch(searchTerm, statusFilter, sortBy, sortOrder);
}, [searchTerm, statusFilter, sortBy, sortOrder]);
```

### Usage Example

```javascript
<SensorDataTable
  sensors={sensors}
  loading={loading}
  onRowClick={(sensor) => {
    setSelectedSensor(sensor);
    setShowDetailModal(true);
  }}
/>
```

### Column Headers

| Header | Sortable | Filterable | Format |
|--------|----------|-----------|--------|
| Sensor ID | ✓ | - | Code |
| Location | ✓ | - | Text |
| Temperature | ✓ | - | Badge |
| Humidity | ✓ | - | Badge |
| Last Update | ✓ | - | Relative time |
| Status | ✓ | ✓ | Colored badge |

---

## SensorDetailModal.js

**Location:** `src/components/SensorDetailModal.js`

**Purpose:** Displays detailed information about a specific sensor with historical data and charts.

### Features

- Modal dialog layout
- Sensor information cards
- Historical data loading
- Chart integration
- Refresh capability
- Error handling

### Props

```javascript
{
  show: Boolean,            // Show/hide modal
  onHide: Function,         // Called when modal closes
  sensor: Object            // Sensor object with full details
}
```

### State

```javascript
const [historyData, setHistoryData] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

### Key Methods

#### `fetchSensorHistory()`
- Fetches 24-hour historical data
- Updates chart data
- Handles and displays errors
- Logs success/failure

```javascript
const fetchSensorHistory = async () => {
  try {
    setLoading(true);
    const data = await sensorAPI.getSensorHistory(sensor.sensorId, 24);
    setHistoryData(data);
    logger.success(`Loaded ${data.length} history entries`);
  } catch (err) {
    logger.error(`Failed to load history: ${err.message}`, err);
    setError(`Failed to load sensor history: ${err.message}`);
  }
};
```

### Effects

#### Load History (show, sensor dependencies)
- Runs when modal opens
- Fetches historical data
- Displays charts

```javascript
useEffect(() => {
  if (show && sensor) {
    fetchSensorHistory();
  }
}, [show, sensor]);
```

### Modal Sections

#### Header
- Sensor location name
- Sensor ID in parentheses
- Closable

#### Body - Sensor Information
```
Left Column:
- Sensor ID (code)
- Location
- Status (badge)
- Light Detection (LDR status)

Right Column:
- Current Temperature
- Current Humidity
- Last Updated (relative and absolute time)
```

#### Body - Charts
- Temperature trend chart
- Humidity trend chart
- 24-hour historical data

#### Footer
- Close button
- Refresh Data button (with loading spinner)

### Usage Example

```javascript
<SensorDetailModal
  show={showDetailModal}
  onHide={() => setShowDetailModal(false)}
  sensor={selectedSensor}
/>
```

### Data Display

#### Absolute Timestamp
`2024-03-31 10:30:00`

#### Relative Timestamp
`2 minutes ago`

#### Temperature
`23.5°C` (1 decimal place)

#### Humidity
`65.2%` (1 decimal place)

---

## SensorCharts.js

**Location:** `src/components/SensorCharts.js`

**Purpose:** Displays historical temperature and humidity data as line charts using Recharts.

### Features

- Temperature trend visualization
- Humidity trend visualization
- Interactive tooltips
- Responsive sizing
- Legend display
- Loading states
- Error handling

### Props

```javascript
{
  sensorId: String,         // Sensor ID (for logging)
  historyData: Array,       // Historical data points
  sensorName: String        // Sensor location name for display
}
```

### State

```javascript
const [chartData, setChartData] = useState([]);
const [loading, setLoading] = useState(true);
```

### Key Methods

#### `formatChartData(historyData)`
- Converts API response to chart format
- Extracts timestamp, temperature, humidity
- Formats time for display

```javascript
const formatted = historyData.map((entry) => ({
  time: formatTimestamp(entry.timestamp, 'HH:mm'),
  temperature: parseFloat(entry.temperature),
  humidity: parseFloat(entry.humidity),
  timestamp: entry.timestamp,
}));
```

### Effects

#### Format Data (historyData dependency)
- Runs when history data received
- Prepares data for Recharts
- Sets loading to false

```javascript
useEffect(() => {
  const formatted = formatChartData(historyData);
  setChartData(formatted);
  setLoading(false);
}, [historyData]);
```

### Chart Configuration

#### Temperature Chart
```javascript
<LineChart data={chartData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="time" />
  <YAxis label={{ value: 'Temperature (°C)' }} />
  <Tooltip formatter={(value) => `${value.toFixed(2)}°C`} />
  <Legend />
  <Line 
    type="monotone" 
    dataKey="temperature" 
    stroke="#ff7300"
    dot={false}
    name="Temperature (°C)"
  />
</LineChart>
```

#### Humidity Chart
```javascript
<LineChart data={chartData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="time" />
  <YAxis label={{ value: 'Humidity (%)' }} />
  <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
  <Legend />
  <Line 
    type="monotone" 
    dataKey="humidity" 
    stroke="#2196F3"
    dot={false}
    name="Humidity (%)"
  />
</LineChart>
```

### Chart Colors

- **Temperature**: Orange (#ff7300)
- **Humidity**: Blue (#2196F3)
- **Grid**: Light gray (#ddd)

### Data Format Requirements

Input array format:
```javascript
[
  {
    timestamp: "2024-03-31T02:00:00Z",
    temperature: 18.2,
    humidity: 72.5
  },
  // ... more entries
]
```

Output chart format:
```javascript
[
  {
    time: "02:00",
    temperature: 18.2,
    humidity: 72.5,
    timestamp: "2024-03-31T02:00:00Z"
  },
  // ... more entries
]
```

### States

#### Loading
```javascript
if (loading) {
  return <Spinner animation="border" />;
}
```

#### No Data
```javascript
if (!chartData || chartData.length === 0) {
  return <p>No historical data available</p>;
}
```

#### Data Display
Both charts rendered side-by-side with responsive containers.

### Usage Example

```javascript
<SensorCharts
  sensorId={sensor.sensorId}
  historyData={historyData}
  sensorName={sensor.locationName}
/>
```

---

## StatusIndicator.js

**Location:** `src/components/StatusIndicator.js`

**Purpose:** Displays sensor status with visual indicators (active/inactive).

### Features

- Color-coded status badges
- Animated pulsing for active sensors
- Custom labels support
- Bootstrap badge integration
- Inline status dot

### Props

```javascript
{
  status: String,           // "active" or "inactive"
  label: String            // Optional custom label (default: status text)
}
```

### Visual States

#### Active Status
- Background: Green (`#28a745`)
- Indicator: Pulsing green dot
- Text: "Active"
- Animation: 2-second pulse effect

#### Inactive Status
- Background: Red (`#dc3545`)
- Indicator: Static red dot
- Text: "Inactive"
- Animation: None

### HTML Structure

```html
<span class="badge bg-success d-inline-flex align-items-center">
  <span class="status-dot me-2" style="...animation..." />
  Active
</span>
```

### Animation

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-dot {
  animation: pulse 2s infinite;
}
```

### Usage Examples

```javascript
// Default - shows "Active" or "Inactive"
<StatusIndicator status="active" />

// Custom label
<StatusIndicator status="active" label="Currently Transmitting" />

// In table
<StatusIndicator status={sensor.status} />

// In detail modal
<StatusIndicator status={sensor.status} />
```

### Styling

Bootstrap badge classes:
- `badge`: Base badge styling
- `bg-success`: Green background for active
- `bg-danger`: Red background for inactive
- `d-inline-flex`: Inline flex display
- `align-items-center`: Center align items

---

## Component Composition Tree

```
App
└── Dashboard
    ├── SensorDataTable
    │   └── StatusIndicator (for each status cell)
    ├── SensorDetailModal
    │   ├── StatusIndicator
    │   └── SensorCharts
    │       ├── LineChart (Temperature)
    │       └── LineChart (Humidity)
    └── Summary Cards
```

## Data Flow

```
Dashboard (fetches data)
    ↓
useEffect (every 5 seconds)
    ↓
API Call (GET /api/sensors)
    ↓
Update sensors state
    ↓
Re-render SensorDataTable
    ↓
User clicks row
    ↓
Set selectedSensor
    ↓
Show SensorDetailModal
    ↓
Fetch history data
    ↓
Render SensorCharts
```

## Component Communication

- **Parent to Child**: Props (sensors, loading, onRowClick)
- **Child to Parent**: Callbacks (onRowClick, onHide)
- **Global State**: Logger (for logging)
- **Shared Services**: apiService, helpers

---

**Last Updated**: March 31, 2024
**Status**: ✅ Complete Documentation
