/**
 * SensorDetailModal Component - Shows detailed sensor information
 */

import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import SensorCharts from './SensorCharts';
import StatusIndicator from './StatusIndicator';
import { sensorAPI } from '../services/apiService';
import { logger } from '../services/logger';
import {
  formatTimestamp,
  getRelativeTime,
  formatTemperature,
  formatHumidity,
} from '../utils/helpers';

const SensorDetailModal = ({ show, onHide, sensor }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show && sensor) {
      fetchSensorHistory();
    }
  }, [show, sensor]);

  const fetchSensorHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      logger.info(`Loading history for sensor ${sensor.sensorId}`);

      const data = await sensorAPI.getSensorHistory(sensor.sensorId, 24);
      setHistoryData(data);
      logger.success(`Loaded ${data.length} history entries for sensor ${sensor.sensorId}`);
    } catch (err) {
      const message = `Failed to load sensor history: ${err.message}`;
      setError(message);
      logger.error(message, err);
    } finally {
      setLoading(false);
    }
  };

  if (!sensor) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-light" style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
        <Modal.Title style={{ color: '#000', fontWeight: '600' }}>
          <i className="fas fa-info-circle me-2" style={{ color: '#2c3e50' }}></i>
          {sensor.locationName} ({sensor.sensorId})
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4" style={{ backgroundColor: '#ffffff' }}>
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Sensor Overview */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card bg-light" style={{ backgroundColor: '#f8f9fa', border: '1px solid #ddd' }}>
              <div className="card-body">
                <h6 className="mb-3" style={{ color: '#000', fontWeight: '600' }}>
                  <strong>Sensor Information</strong>
                </h6>
                <p className="mb-2" style={{ color: '#333' }}>
                  <strong>Sensor ID:</strong> <code style={{ backgroundColor: '#e9ecef', color: '#000', padding: '0.2rem 0.4rem', borderRadius: '3px' }}>{sensor.sensorId}</code>
                </p>
                <p className="mb-2" style={{ color: '#333' }}>
                  <strong>Location:</strong> {sensor.locationName}
                </p>
                <p className="mb-2" style={{ color: '#333' }}>
                  <strong>Status:</strong> <StatusIndicator status={sensor.status} />
                </p>
                {sensor.ldStatus !== undefined && (
                  <p className="mb-0" style={{ color: '#333' }}>
                    <strong>Light Detection:</strong>{' '}
                    <span className="badge bg-info">{sensor.ldStatus ? 'Day' : 'Night'}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card bg-light" style={{ backgroundColor: '#f8f9fa', border: '1px solid #ddd' }}>
              <div className="card-body">
                <h6 className="mb-3" style={{ color: '#000', fontWeight: '600' }}>
                  <strong>Latest Reading</strong>
                </h6>
                <p className="mb-2" style={{ color: '#333' }}>
                  <strong>Temperature:</strong>{' '}
                  <span className="fs-5">
                    <strong style={{ color: '#ff7300' }}>{formatTemperature(sensor.temperature)}°C</strong>
                  </span>
                </p>
                <p className="mb-2" style={{ color: '#333' }}>
                  <strong>Humidity:</strong>{' '}
                  <span className="fs-5">
                    <strong style={{ color: '#2196F3' }}>{formatHumidity(sensor.humidity)}</strong>
                  </span>
                </p>
                <p className="mb-0" style={{ color: '#333' }}>
                  <strong>Last Updated:</strong> {getRelativeTime(sensor.lastUpdate)}
                  <br />
                  <small className="text-muted">
                    {formatTimestamp(sensor.lastUpdate, 'PPpp')}
                  </small>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading charts...</span>
            </Spinner>
            <p className="mt-2 text-muted">Loading historical data...</p>
          </div>
        ) : (
          <SensorCharts
            sensorId={sensor.sensorId}
            historyData={historyData}
            sensorName={sensor.locationName}
          />
        )}
      </Modal.Body>

      <Modal.Footer className="bg-light" style={{ backgroundColor: '#f8f9fa', borderTop: '1px solid #ddd' }}>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={fetchSensorHistory} disabled={loading}>
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Refreshing...
            </>
          ) : (
            <>
              <i className="fas fa-sync-alt me-2"></i>Refresh Data
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SensorDetailModal;
