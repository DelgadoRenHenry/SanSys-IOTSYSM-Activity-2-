/**
 * Dashboard Component - Main dashboard for IoT sensor monitoring
 */

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Button, Spinner } from 'react-bootstrap';
import SensorDataTable from './SensorDataTable';
import SensorDetailModal from './SensorDetailModal';
import { sensorAPI, generateMockSensors } from '../services/apiService';
import { logger } from '../services/logger';

const Dashboard = () => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds

  // Fetch sensor data
  const fetchSensors = async () => {
    try {
      logger.info('Fetching sensor data from API');
      const data = await sensorAPI.getAllSensors();

      // If API doesn't return data, use mock data for development
      if (!data || data.length === 0) {
        logger.warn('No data from API, using mock data for demonstration');
        const mockData = generateMockSensors(5);
        setSensors(mockData);
      } else {
        setSensors(data);
      }

      setError(null);
      setLastRefresh(new Date());
      logger.success('Sensor data fetched successfully', { count: data?.length || 0 });
    } catch (err) {
      logger.error('Error fetching sensors', {
        message: err.message,
        status: err.response?.status,
      });
      // Use mock data as fallback for demonstration
      logger.info('Using mock data as fallback');
      const mockData = generateMockSensors(5);
      setSensors(mockData);
      setError(`Unable to fetch live data: ${err.message}. Showing demo data.`);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchSensors();
    logger.info('Dashboard initialized');
  }, []);

  // Auto-refresh data
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const intervalId = setInterval(() => {
      logger.debug('Auto-refresh triggered');
      fetchSensors();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefreshEnabled, refreshInterval]);

  // Handle row click to show detail modal
  const handleSensorRowClick = (sensor) => {
    logger.info(`Opening details for sensor: ${sensor.sensorId}`);
    setSelectedSensor(sensor);
    setShowDetailModal(true);
  };

  // Handle modal close
  const handleDetailModalClose = () => {
    setShowDetailModal(false);
    setSelectedSensor(null);
  };

  // Manual refresh
  const handleManualRefresh = () => {
    logger.info('Manual refresh triggered');
    setLoading(true);
    fetchSensors();
  };

  return (
    <div className="dashboard-container bg-light min-vh-100" style={{ paddingTop: '20px' }}>
      <Container fluid>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="mb-1" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000' }}>
                  Smart Agriculture Dashboard
                </h1>
                <p className="text-muted">Real-time monitoring of environmental conditions across sensor nodes</p>
              </div>
              <div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleManualRefresh}
                  disabled={loading}
                >
                  <i className="fas fa-sync-alt me-2"></i>
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* Last Refresh Time */}
        {lastRefresh && (
          <Row className="mb-2">
            <Col>
              <small className="text-muted">
                Last updated: <strong>{lastRefresh.toLocaleTimeString()}</strong>
              </small>
            </Col>
          </Row>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </Alert>
        )}

        {/* Sensor Nodes Section */}
        <Row className="mb-4">
          <Col>
            <Card className="bg-white border-0 shadow-sm">
              <Card.Header className="bg-light border-bottom" style={{ paddingBottom: '1rem' }}>
                <h5 className="mb-0" style={{ color: '#000', fontWeight: '600' }}>
                  <i className="fas fa-microchip me-2" style={{ color: '#2c3e50' }}></i>
                  <strong>Sensor Nodes</strong>
                </h5>
              </Card.Header>
              <Card.Body style={{ paddingTop: '1.5rem' }}>
                {loading && sensors.length === 0 ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" role="status" className="mb-3" variant="primary">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="text-muted">Loading sensor data...</p>
                  </div>
                ) : (
                  <SensorDataTable
                    sensors={sensors}
                    loading={false}
                    onRowClick={handleSensorRowClick}
                  />
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Sensor Detail Modal */}
      <SensorDetailModal
        show={showDetailModal}
        onHide={handleDetailModalClose}
        sensor={selectedSensor}
      />

      <style>{`
        .dashboard-container {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        
        .sensor-row-clickable {
          transition: background-color 0.2s ease;
        }
        
        .sensor-row-clickable:hover {
          background-color: #f0f0f0 !important;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
