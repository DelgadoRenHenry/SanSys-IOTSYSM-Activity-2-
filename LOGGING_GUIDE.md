# Logging System Documentation

## Overview

The Smart Agriculture IoT Dashboard includes a comprehensive logging system that records all operations, errors, and user interactions. This document explains how the logging system works and how to use it.

## Features

✅ **Comprehensive Logging**: All operations automatically logged
✅ **Multiple Log Levels**: INFO, ERROR, WARN, DEBUG, SUCCESS
✅ **Persistent Storage**: Logs stored in browser's localStorage
✅ **Export Capability**: Download logs as JSON for analysis
✅ **Memory Management**: Keeps only the 1000 most recent logs
✅ **Timestamp Tracking**: Every log includes ISO 8601 timestamp
✅ **Console Output**: Real-time logging to browser console

## Log Levels

### INFO
General information about operations
```javascript
logger.info('Sensor data fetched successfully', { count: 5 });
```

### SUCCESS
Successful completion of important operations
```javascript
logger.success('API connection established');
```

### ERROR
Error conditions that need attention
```javascript
logger.error('Failed to fetch sensors', { status: 500, message: '...' });
```

### WARN
Warning messages about potential issues
```javascript
logger.warn('API slow response', { time: 3000 });
```

### DEBUG
Detailed debugging information
```javascript
logger.debug('Filtering sensors by status', { status: 'active' });
```

## Usage Examples

### In Your Application Code

```javascript
import { logger } from './services/logger';

// Log information
logger.info('Application started', { 
  timestamp: new Date(),
  url: window.location.href 
});

// Log successful operations
logger.success('Sensors loaded', { count: 5 });

// Log errors
logger.error('API error occurred', { 
  status: 500,
  message: 'Internal Server Error' 
});

// Log warnings
logger.warn('Sensor offline', { sensorId: 'SENSOR_001' });

// Log debug information
logger.debug('Received sensor data', { data: sensorObject });
```

### In Browser Console

Open browser console (F12 → Console) and run:

```javascript
// Import logger
import { logger } from './services/logger';

// Get recent logs
const logs = logger.getLogs(50);
console.table(logs);

// Get only error logs
const errors = logger.getLogsByLevel('ERROR');
console.table(errors);

// Export logs to file
logger.exportLogs();

// View log as formatted string
const logsText = logger.getLogsAsString();
console.log(logsText);

// Clear all logs
logger.clearLogs();
```

## Accessing Logs

### Method 1: Browser Console

1. Open browser DevTools: F12
2. Go to "Console" tab
3. Logs appear in real-time
4. All levels color-coded for easy identification

### Method 2: Application Tab (LocalStorage)

1. Open browser DevTools: F12
2. Go to "Application" tab
3. Left sidebar → Local Storage
4. Click on `http://localhost:3000`
5. Look for key: `iot_dashboard_logs`
6. Contains JSON array of all logs
7. Can copy/paste for analysis

### Method 3: Programmatic Access

```javascript
const recentLogs = logger.getLogs(100);
const errorLogs = logger.getLogsByLevel('ERROR');
const warningLogs = logger.getLogsByLevel('WARN');
```

### Method 4: Export to File

```javascript
logger.exportLogs();
```

This downloads a JSON file named:
`iot-logs-2024-03-31.json`

## Log Format

Each log entry contains:

```javascript
{
  "id": "2024-03-31T10:30:00.000Z-0.123456",
  "timestamp": "2024-03-31T10:30:00.000Z",
  "level": "INFO",
  "message": "Sensor data fetched successfully",
  "data": {
    "sensorCount": 5,
    "activeSensors": 4
  }
}
```

## System Events Logged

### Application Lifecycle
- ✅ Application started
- ✅ Application cleanup
- ✅ Dashboard initialized

### API Operations
- ✅ Fetching sensor data
- ✅ Successfully fetched sensors
- ✅ Failed to fetch sensors
- ✅ Fetching sensor details
- ✅ Fetching historical data
- ✅ API health check

### User Actions
- ✅ Opening sensor details modal
- ✅ Manual refresh triggered
- ✅ Auto-refresh triggered
- ✅ Search query executed
- ✅ Filter applied
- ✅ Sort order changed

### Data Processing
- ✅ Filtering sensors
- ✅ Sorting sensors
- ✅ Calculating statistics
- ✅ Preparing chart data
- ✅ Validating sensor data

### Error Handling
- ✅ API connection failure
- ✅ Data validation errors
- ✅ Invalid timestamps
- ✅ Missing required fields
- ✅ Chart rendering errors

## Log Limits

### Storage Limits
- **Maximum logs**: 1000 entries
- **Storage location**: Browser localStorage
- **Typical size**: ~100-200 KB for 1000 logs
- **Automatic cleanup**: Oldest logs removed when limit reached

### Auto-cleanup
The system automatically:
- Keeps only 1000 most recent logs
- Removes oldest entries when new logs added
- Prevents localStorage from bloating
- Maintains performance

## Analyzing Logs

### View Critical Errors
```javascript
const errors = logger.getLogsByLevel('ERROR');
console.table(errors);
```

### Find Specific Operations
```javascript
// Get logs matching a pattern
const logsContaining = logger.getLogs().filter(log => 
  log.message.includes('sensor')
);
console.table(logsContaining);
```

### Check Timeline
```javascript
// Logs are in chronological order
const logs = logger.getLogs(100);
logs.forEach(log => {
  const time = new Date(log.timestamp);
  console.log(`${time.toLocaleTimeString()}: ${log.level} - ${log.message}`);
});
```

## Logging Best Practices

### What to Log
✅ **DO log:**
- Important operations (API calls, user actions)
- Errors and exceptions
- Performance metrics
- Data validation results
- System state changes

❌ **DON'T log:**
- Passwords or sensitive credentials
- Personal identification information
- Large data objects unnecessarily
- Verbose debug output in production

### Log Message Tips
- Keep messages concise and descriptive
- Use action verbs (loaded, failed, updated)
- Include relevant identifiers (sensorId, userId)
- Provide context data in the second parameter

### Example Good Logging Practice
```javascript
// Good
logger.info('Sensor updated', { sensorId: 'SENSOR_001', field: 'temperature' });

// Bad
logger.info('Something happened');
logger.info('x');
logger.info(entireDataObject);
```

## Production Considerations

### Enable Logging in Production
```javascript
// .env
REACT_APP_DEBUG=true
```

### Periodic Log Cleanup
```javascript
// Run periodically to prevent storage overflow
if (localStorage.getItem('iot_dashboard_logs')) {
  const logs = logger.getLogs(MAX_LOGS);
  logger.clearLogs();
  logs.forEach(log => logger.addLog(log.level, log.message, log.data));
}
```

### Export for Analysis
```javascript
// Setup automatic daily export
setInterval(() => {
  logger.exportLogs();
}, 24 * 60 * 60 * 1000); // Every 24 hours
```

## Troubleshooting Logging

### Logs Not Saving
- Check localStorage is enabled
- Verify browser privacy settings
- Check available storage space
- Try refreshing page

### Logs Not Appearing in Console
- Open DevTools (F12)
- Go to Console tab
- Check filter settings
- Try running: `logger.getLogs()`

### Cannot Export Logs
- Disable browser popup blocker
- Check browser security settings
- Verify sufficient permissions
- Try alternative browsers

### Logs Disappearing
- Check if localStorage manually cleared
- Browser tab history cleaned (clears logs)
- Storage limit exceeded (oldest removed)
- Browser privacy mode (temporary logs)

## Advanced Usage

### Custom Logging
```javascript
// Add custom log entry
logger.addLog('INFO', 'Custom message', { custom: 'data' });
```

### Filter Logs by Time
```javascript
const recent = logger.getLogs().filter(log => {
  const logTime = new Date(log.timestamp);
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return logTime > fiveMinutesAgo;
});
```

### Generate Report
```javascript
const logs = logger.getLogs();
const report = {
  totalLogs: logs.length,
  byLevel: {
    INFO: logs.filter(l => l.level === 'INFO').length,
    ERROR: logs.filter(l => l.level === 'ERROR').length,
    WARN: logs.filter(l => l.level === 'WARN').length,
    DEBUG: logs.filter(l => l.level === 'DEBUG').length,
    SUCCESS: logs.filter(l => l.level === 'SUCCESS').length,
  },
  timespan: {
    first: logs[0]?.timestamp,
    last: logs[logs.length - 1]?.timestamp,
  }
};
console.table(report);
```

## Integration with Monitoring

### Send Logs to Server
```javascript
async function sendLogsToServer() {
  const logs = logger.getLogs();
  await fetch('/api/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logs)
  });
}
```

### Periodic Backup
```javascript
// Backup logs every hour
setInterval(() => {
  const logs = logger.getLogsAsString();
  // Send to server via API
  // Store in database
  // Archive locally
}, 60 * 60 * 1000);
```

## Reference

### Logger Methods
- `logger.info(message, data)` - Information
- `logger.error(message, data)` - Error
- `logger.warn(message, data)` - Warning
- `logger.debug(message, data)` - Debug
- `logger.success(message, data)` - Success
- `logger.getLogs(limit)` - Get recent logs
- `logger.getLogsByLevel(level)` - Filter by level
- `logger.getLogsAsString()` - Export as string
- `logger.exportLogs()` - Download as JSON
- `logger.clearLogs()` - Clear all logs

### Log Entry Properties
- `id` - Unique identifier
- `timestamp` - ISO 8601 timestamp
- `level` - Log level (INFO, ERROR, WARN, DEBUG, SUCCESS)
- `message` - Log message
- `data` - Additional data object (optional)

---

**Logging is critical for monitoring system health, debugging issues, and understanding user behavior. Use it effectively!**
