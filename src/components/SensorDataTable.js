/**
 * SensorDataTable Component - Displays sensor data with search, filter, and sort
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Table, Form, Spinner, Row, Col } from 'react-bootstrap';
import StatusIndicator from './StatusIndicator';
import { logger } from '../services/logger';
import {
  formatTimestamp,
  getRelativeTime,
  formatTemperature,
  formatHumidity,
  sortSensorData,
  filterSensorsByStatus,
  searchSensors,
  debounce,
} from '../utils/helpers';

const SensorDataTable = ({ sensors = [], loading = false, onRowClick = null }) => {
  const [filteredSensors, setFilteredSensors] = useState(sensors);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('location');
  const [sortOrder, setSortOrder] = useState('asc');

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((term, status, sort, order) => {
      logger.debug('Filtering sensors', { searchTerm: term, statusFilter: status, sortBy: sort });
      let results = sensors;

      // Apply search
      results = searchSensors(results, term);

      // Apply status filter
      results = filterSensorsByStatus(results, status);

      // Apply sort
      results = sortSensorData(results, sort, order);

      setFilteredSensors(results);
    }, 300),
    [sensors]
  );

  // Update filtered data when inputs change
  useEffect(() => {
    debouncedSearch(searchTerm, statusFilter, sortBy, sortOrder);
  }, [searchTerm, statusFilter, sortBy, sortOrder, debouncedSearch]);

  // Handle sort column click
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    logger.debug(`Sorting by ${column} (${sortOrder})`);
  };

  // Get sort icon
  const getSortIcon = (column) => {
    if (sortBy !== column) return '⇅';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" className="mb-3" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="text-muted">Loading sensor data...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filter Controls */}
      <Row className="g-3 mb-4">
        <Col md={6}>
          <Form.Group className="mb-0">
            <Form.Control
              type="text"
              placeholder="🔍 Search by Sensor ID or Location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control-lg"
              style={{ 
                borderRadius: '8px',
                border: '2px solid #2c3e50',
                padding: '0.75rem 1rem',
                fontSize: '0.95rem',
                backgroundColor: '#fff',
                color: '#000',
                fontWeight: '500'
              }}
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-0">
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select-lg"
              style={{ 
                borderRadius: '8px',
                border: '2px solid #2c3e50',
                padding: '0.75rem 1rem',
                fontSize: '0.95rem',
                backgroundColor: '#fff',
                color: '#000',
                fontWeight: '500'
              }}
            >
              <option value="all">📊 All Sensors</option>
              <option value="active">✓ Active Only</option>
              <option value="inactive">✗ Inactive Only</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Table */}
      {filteredSensors.length === 0 ? (
        <div className="text-center py-5 text-muted" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <i className="fas fa-inbox me-2" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
          <p style={{ marginTop: '0.5rem' }}>No sensors found</p>
        </div>
      ) : (
        <div className="table-responsive" style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Table hover className="mb-0" striped borderless>
            <thead style={{ backgroundColor: '#2c3e50', color: '#fff' }}>
              <tr>
                <th
                  style={{ 
                    cursor: 'pointer', 
                    fontWeight: '600', 
                    fontSize: '0.9rem',
                    padding: '1rem',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('sensorId')}
                  title="Click to sort"
                >
                  <i className="fas fa-microchip me-2"></i>
                  Sensor ID {getSortIcon('sensorId') !== '⇅' && <small>{getSortIcon('sensorId')}</small>}
                </th>
                <th
                  style={{ 
                    cursor: 'pointer', 
                    fontWeight: '600', 
                    fontSize: '0.9rem',
                    padding: '1rem',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('location')}
                  title="Click to sort"
                >
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Location {getSortIcon('location') !== '⇅' && <small>{getSortIcon('location')}</small>}
                </th>
                <th
                  style={{ 
                    cursor: 'pointer', 
                    fontWeight: '600', 
                    fontSize: '0.9rem',
                    padding: '1rem',
                    textAlign: 'right',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('temperature')}
                  title="Click to sort"
                >
                  <i className="fas fa-thermometer-half me-2"></i>
                  Temperature {getSortIcon('temperature') !== '⇅' && <small>{getSortIcon('temperature')}</small>}
                </th>
                <th
                  style={{ 
                    cursor: 'pointer', 
                    fontWeight: '600', 
                    fontSize: '0.9rem',
                    padding: '1rem',
                    textAlign: 'right',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('humidity')}
                  title="Click to sort"
                >
                  <i className="fas fa-tint me-2"></i>
                  Humidity {getSortIcon('humidity') !== '⇅' && <small>{getSortIcon('humidity')}</small>}
                </th>
                <th
                  style={{ 
                    cursor: 'pointer', 
                    fontWeight: '600', 
                    fontSize: '0.9rem',
                    padding: '1rem',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('timestamp')}
                  title="Click to sort"
                >
                  <i className="fas fa-clock me-2"></i>
                  Last Update {getSortIcon('timestamp') !== '⇅' && <small>{getSortIcon('timestamp')}</small>}
                </th>
                <th style={{ fontWeight: '600', fontSize: '0.9rem', padding: '1rem' }}>
                  <i className="fas fa-heart me-2"></i>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSensors.map((sensor, index) => (
                <tr
                  key={sensor.sensorId}
                  style={{ 
                    cursor: onRowClick ? 'pointer' : 'default',
                    borderBottom: '1px solid #e0e0e0',
                    transition: 'all 0.2s ease',
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa'
                  }}
                  onClick={() => onRowClick && onRowClick(sensor)}
                  onMouseEnter={(e) => {
                    if (onRowClick) e.currentTarget.style.backgroundColor = '#e8f4f8';
                  }}
                  onMouseLeave={(e) => {
                    if (onRowClick) e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
                  }}
                  className={onRowClick ? 'sensor-row-clickable' : ''}
                >
                  <td style={{ fontWeight: '600', fontSize: '0.95rem', padding: '1rem', color: '#2c3e50' }}>
                    <code style={{ backgroundColor: '#f0f0f0', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                      {sensor.sensorId}
                    </code>
                  </td>
                  <td style={{ fontSize: '0.95rem', padding: '1rem', color: '#34495e' }}>
                    {sensor.locationName}
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '0.95rem', padding: '1rem', color: '#e74c3c', fontWeight: '500' }}>
                    {formatTemperature(sensor.temperature)}°C
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '0.95rem', padding: '1rem', color: '#3498db', fontWeight: '500' }}>
                    {formatHumidity(sensor.humidity)}
                  </td>
                  <td style={{ fontSize: '0.9rem', padding: '1rem', color: '#7f8c8d' }}>
                    {getRelativeTime(sensor.lastUpdate)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <StatusIndicator status={sensor.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <style>{`
        .table-responsive {
          border-radius: 8px;
          overflow: hidden;
        }

        .table thead th {
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          color: white;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 1rem !important;
          border: none;
        }

        .table thead th:hover {
          background: linear-gradient(135deg, #1a252f 0%, #2c3e50 100%);
        }

        .table tbody td {
          vertical-align: middle;
          padding: 1rem !important;
          border-bottom: 1px solid #ecf0f1;
        }

        .table tbody tr:last-child td {
          border-bottom: none;
        }

        .sensor-row-clickable:hover {
          box-shadow: inset 0 0 10px rgba(52, 152, 219, 0.1);
        }

        code {
          background-color: #ecf0f1;
          color: #2c3e50;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};

export default SensorDataTable;
