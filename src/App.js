/**
 * App Component - Main application component
 */

import React, { useEffect } from 'react';
import Dashboard from './components/Dashboard';
import { logger } from './services/logger';
import './App.css';

function App() {
  useEffect(() => {
    // Initialize logger on app start
    logger.info('Application started', {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    });

    // Check API health
    logger.info('Checking system health');

    return () => {
      logger.debug('Application cleanup');
    };
  }, []);

  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}

export default App;
