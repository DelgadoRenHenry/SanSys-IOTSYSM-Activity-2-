/**
 * SensorCharts Component - Displays temperature and humidity trends using Recharts
 */

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatChartData } from '../utils/helpers';
import { logger } from '../services/logger';

const SensorCharts = ({ sensorId, historyData = [], sensorName = '' }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      logger.debug(`Preparing chart data for sensor ${sensorId}`, {
        dataPoints: historyData.length,
      });

      const formatted = formatChartData(historyData);
      setChartData(formatted);
      setLoading(false);
    } catch (error) {
      logger.error(`Error preparing chart data for sensor ${sensorId}`, error);
      setLoading(false);
    }
  }, [historyData, sensorId]);

  if (loading) {
    return (
      <div className="card" style={{ backgroundColor: '#fff', border: '1px solid #ddd' }}>
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading charts...</span>
          </div>
          <p style={{ color: '#666', marginTop: '1rem' }}>Loading charts...</p>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="card" style={{ backgroundColor: '#fff', border: '1px solid #ddd' }}>
        <div className="card-body text-center" style={{ padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            <i className="fas fa-inbox" style={{ color: '#999' }}></i>
          </div>
          <p style={{ color: '#000', fontSize: '1.1rem', fontWeight: '500', margin: '0.5rem 0' }}>
            No historical data available for this sensor
          </p>
          <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Historical data will be available once the sensor sends readings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ backgroundColor: '#fff', border: '1px solid #ddd' }}>
      <div className="card-header bg-light" style={{ backgroundColor: '#f8f9fa' }}>
        <h5 className="mb-0" style={{ color: '#000', fontWeight: '600' }}>
          <i className="fas fa-chart-line me-2" style={{ color: '#2c3e50' }}></i>
          {sensorName} - Historical Trends (Last 24 Hours)
        </h5>
      </div>
      <div className="card-body" style={{ backgroundColor: '#ffffff', padding: '1.5rem' }}>
        <div className="mb-4">
          <h6 style={{ color: '#000', fontWeight: '600', marginBottom: '1rem' }}>
            <strong>Temperature Trend</strong>
          </h6>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #eee', borderRadius: '4px', padding: '1rem' }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                <XAxis dataKey="time" stroke="#666" />
                <YAxis label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }} stroke="#666" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #2c3e50', borderRadius: '4px', color: '#000' }}
                  formatter={(value) => `${value.toFixed(2)}°C`}
                />
                <Legend wrapperStyle={{ color: '#000' }} />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#ff7300"
                  dot={false}
                  name="Temperature (°C)"
                  isAnimationActive={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h6 style={{ color: '#000', fontWeight: '600', marginBottom: '1rem' }}>
            <strong>Humidity Trend</strong>
          </h6>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #eee', borderRadius: '4px', padding: '1rem' }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                <XAxis dataKey="time" stroke="#666" />
                <YAxis label={{ value: 'Humidity (%)', angle: -90, position: 'insideLeft' }} stroke="#666" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #2c3e50', borderRadius: '4px', color: '#000' }}
                  formatter={(value) => `${value.toFixed(2)}%`}
                />
                <Legend wrapperStyle={{ color: '#000' }} />
                <Line
                  type="monotone"
                  dataKey="humidity"
                  stroke="#2196F3"
                  dot={false}
                  name="Humidity (%)"
                  isAnimationActive={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorCharts;
