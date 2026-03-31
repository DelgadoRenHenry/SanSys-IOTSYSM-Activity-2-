/**
 * Helper utilities for the IoT Dashboard
 */

import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format timestamp to readable date/time
 */
export const formatTimestamp = (timestamp, formatString = 'MMM dd, yyyy HH:mm:ss') => {
  if (!timestamp) return 'N/A';
  try {
    return format(parseISO(timestamp), formatString);
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Format timestamp to relative time (e.g., "2 minutes ago")
 */
export const getRelativeTime = (timestamp) => {
  if (!timestamp) return 'Never';
  try {
    return formatDistanceToNow(parseISO(timestamp), { addSuffix: true });
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Format temperature to 1 decimal place
 */
export const formatTemperature = (temp) => {
  if (temp === null || temp === undefined) return 'N/A';
  return parseFloat(temp).toFixed(1);
};

/**
 * Format humidity as percentage
 */
export const formatHumidity = (humidity) => {
  if (humidity === null || humidity === undefined) return 'N/A';
  return `${parseFloat(humidity).toFixed(1)}%`;
};

/**
 * Get status badge classes based on status
 */
export const getStatusClasses = (status) => {
  const baseClasses = 'badge';
  if (status === 'active') {
    return `${baseClasses} bg-success`;
  } else if (status === 'inactive') {
    return `${baseClasses} bg-danger`;
  }
  return `${baseClasses} bg-secondary`;
};

/**
 * Get status color for charts/visualizations
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return '#28a745'; // Green
    case 'inactive':
      return '#dc3545'; // Red
    default:
      return '#6c757d'; // Gray
  }
};

/**
 * Determine if sensor is active based on timestamp
 */
export const isSensorActive = (lastUpdateTime, thresholdMinutes = 1) => {
  if (!lastUpdateTime) return false;
  const lastUpdate = new Date(lastUpdateTime);
  const now = new Date();
  const diffMinutes = (now - lastUpdate) / (1000 * 60);
  return diffMinutes <= thresholdMinutes;
};

/**
 * Calculate average of array of numbers
 */
export const calculateAverage = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
};

/**
 * Calculate min and max values
 */
export const getMinMax = (numbers) => {
  if (!numbers || numbers.length === 0) return { min: 0, max: 0 };
  return {
    min: Math.min(...numbers),
    max: Math.max(...numbers),
  };
};

/**
 * Sort sensor data by different criteria
 */
export const sortSensorData = (data, sortBy = 'location', sortOrder = 'asc') => {
  const sorted = [...data];

  sorted.sort((a, b) => {
    let compareA, compareB;

    switch (sortBy) {
      case 'temperature':
        compareA = a.temperature || 0;
        compareB = b.temperature || 0;
        break;
      case 'humidity':
        compareA = a.humidity || 0;
        compareB = b.humidity || 0;
        break;
      case 'timestamp':
        compareA = new Date(a.lastUpdate || 0).getTime();
        compareB = new Date(b.lastUpdate || 0).getTime();
        break;
      case 'location':
      default:
        compareA = (a.locationName || '').toLowerCase();
        compareB = (b.locationName || '').toLowerCase();
    }

    if (sortOrder === 'desc') {
      [compareA, compareB] = [compareB, compareA];
    }

    return compareA > compareB ? 1 : compareA < compareB ? -1 : 0;
  });

  return sorted;
};

/**
 * Filter sensors by status
 */
export const filterSensorsByStatus = (sensors, status) => {
  if (!status || status === 'all') return sensors;
  return sensors.filter((sensor) => sensor.status === status);
};

/**
 * Search sensors by location or sensor ID
 */
export const searchSensors = (sensors, searchTerm) => {
  if (!searchTerm) return sensors;

  const term = searchTerm.toLowerCase();
  return sensors.filter(
    (sensor) =>
      sensor.locationName?.toLowerCase().includes(term) ||
      sensor.sensorId?.toLowerCase().includes(term)
  );
};

/**
 * Validate sensor data
 */
export const validateSensorData = (sensor) => {
  const errors = [];

  if (!sensor.sensorId) errors.push('Missing sensorId');
  if (!sensor.locationName) errors.push('Missing locationName');
  if (sensor.temperature === null || sensor.temperature === undefined) {
    errors.push('Missing temperature data');
  }
  if (sensor.humidity === null || sensor.humidity === undefined) {
    errors.push('Missing humidity data');
  }
  if (!sensor.lastUpdate) errors.push('Missing lastUpdate timestamp');

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Debounce function for search/filter operations
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Get color based on temperature ranges
 */
export const getTemperatureColor = (temp) => {
  if (temp < 0) return '#0066cc'; // Cold - Blue
  if (temp < 10) return '#0099ff'; // Cool - Light Blue
  if (temp < 20) return '#00ff00'; // Moderate - Green
  if (temp < 30) return '#ffcc00'; // Warm - Yellow
  if (temp < 40) return '#ff9900'; // Hot - Orange
  return '#cc0000'; // Very Hot - Red
};

/**
 * Get color based on humidity ranges
 */
export const getHumidityColor = (humidity) => {
  if (humidity < 30) return '#ff9999'; // Too dry - Red
  if (humidity < 50) return '#ffcc99'; // Dry - Orange
  if (humidity < 70) return '#99ff99'; // Ideal - Green
  return '#99ccff'; // Too humid - Blue
};

/**
 * Format sensor data for chart display
 */
export const formatChartData = (historyData) => {
  if (!historyData || !Array.isArray(historyData)) return [];

  return historyData.map((entry) => ({
    time: formatTimestamp(entry.timestamp, 'HH:mm'),
    temperature: parseFloat(entry.temperature),
    humidity: parseFloat(entry.humidity),
    timestamp: entry.timestamp,
  }));
};
