/**
 * API Service - Handles all API communication with the backend
 */

import axios from 'axios';
import { logger } from './logger';

// Configure API base URL - change this to your backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * Sensor service API calls
 */
export const sensorAPI = {
  /**
   * Fetch all sensors
   */
  getAllSensors: async () => {
    try {
      logger.info('Fetching all sensors from API');
      const response = await apiClient.get('/sensors');
      logger.success('Successfully fetched all sensors', {
        count: response.data.length,
      });
      return response.data;
    } catch (error) {
      const errorMessage = `Failed to fetch sensors: ${error.message}`;
      logger.error(errorMessage, {
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  /**
   * Fetch single sensor details
   */
  getSensorById: async (sensorId) => {
    try {
      logger.info(`Fetching sensor details for ID: ${sensorId}`);
      const response = await apiClient.get(`/sensor/${sensorId}`);
      logger.success(`Successfully fetched sensor ${sensorId}`);
      return response.data;
    } catch (error) {
      const errorMessage = `Failed to fetch sensor ${sensorId}: ${error.message}`;
      logger.error(errorMessage, {
        sensorId,
        status: error.response?.status,
      });
      throw error;
    }
  },

  /**
   * Fetch historical data for a sensor (last 24 hours)
   */
  getSensorHistory: async (sensorId, hours = 24) => {
    try {
      logger.info(`Fetching ${hours}h history for sensor: ${sensorId}`);
      const response = await apiClient.get(`/sensor/${sensorId}/history`, {
        params: { hours },
      });
      logger.success(`Successfully fetched ${hours}h history for sensor ${sensorId}`, {
        dataPoints: response.data.length,
      });
      return response.data;
    } catch (error) {
      const errorMessage = `Failed to fetch sensor history: ${error.message}`;
      logger.error(errorMessage, {
        sensorId,
        hours,
        status: error.response?.status,
      });
      throw error;
    }
  },

  /**
   * Get sensor statistics
   */
  getSensorStats: async () => {
    try {
      logger.info('Fetching sensor statistics');
      const response = await apiClient.get('/sensors/stats');
      logger.success('Successfully fetched sensor statistics');
      return response.data;
    } catch (error) {
      logger.warn(`Could not fetch sensor statistics: ${error.message}`);
      // Return default stats if API fails - graceful degradation
      return {
        totalSensors: 0,
        activeSensors: 0,
        inactiveSensors: 0,
      };
    }
  },

  /**
   * Check API health
   */
  healthCheck: async () => {
    try {
      logger.debug('Checking API health');
      const response = await apiClient.get('/health');
      logger.success('API health check passed');
      return true;
    } catch (error) {
      logger.error('API health check failed', {
        message: error.message,
        status: error.response?.status,
      });
      return false;
    }
  },
};

/**
 * Helper to determine sensor status based on timestamp
 */
export const determineSensorStatus = (lastUpdateTime, inactiveThreshold = 60000) => {
  // inactiveThreshold in milliseconds (default 60 seconds = 1 minute)
  if (!lastUpdateTime) return 'inactive';

  const timeSinceUpdate = Date.now() - new Date(lastUpdateTime).getTime();
  return timeSinceUpdate > inactiveThreshold ? 'inactive' : 'active';
};

/**
 * Mock data generator for development/testing
 */
export const generateMockSensors = (count = 5) => {
  logger.info('Generating mock sensor data', { count });
  const locations = [
    'North_Field',
    'Tomato_Greenhouse',
    'South_Field',
    'Lettuce_House',
    'Irrigation_Zone',
  ];

  return Array.from({ length: count }, (_, i) => {
    const now = new Date();
    const minutesAgo = Math.floor(Math.random() * 120); // Random time in last 2 hours
    const isActive = minutesAgo < 5; // Active if data received in last 5 minutes

    return {
      sensorId: `SENSOR_${String(i + 1).padStart(3, '0')}`,
      locationName: locations[i % locations.length],
      temperature: 20 + Math.random() * 15,
      humidity: 40 + Math.random() * 40,
      lastUpdate: new Date(now.getTime() - minutesAgo * 60000).toISOString(),
      status: isActive ? 'active' : 'inactive',
      ldStatus: isActive, // Light Detection - only transmits during day
    };
  });
};

export default apiClient;
