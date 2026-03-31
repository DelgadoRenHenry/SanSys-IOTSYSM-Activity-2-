/**
 * Logger Service - Handles all logging for the IoT Dashboard
 * Logs are stored in localStorage and console
 */

class Logger {
  constructor() {
    this.logs = this.loadLogs();
    this.maxLogs = 1000; // Maximum logs to keep in memory
  }

  /**
   * Load logs from localStorage
   */
  loadLogs() {
    try {
      const stored = localStorage.getItem('iot_dashboard_logs');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load logs from localStorage:', error);
      return [];
    }
  }

  /**
   * Save logs to localStorage
   */
  saveLogs() {
    try {
      // Keep only the most recent logs
      const logsToSave = this.logs.slice(-this.maxLogs);
      localStorage.setItem('iot_dashboard_logs', JSON.stringify(logsToSave));
    } catch (error) {
      console.error('Failed to save logs to localStorage:', error);
    }
  }

  /**
   * Add a log entry
   */
  addLog(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      id: `${timestamp}-${Math.random()}`,
    };

    this.logs.push(logEntry);
    this.saveLogs();

    // Also log to console
    const consoleMethod = console[level.toLowerCase()] || console.log;
    consoleMethod(`[${level}] ${message}`, data || '');

    return logEntry;
  }

  // Log level methods
  info(message, data = null) {
    return this.addLog('INFO', message, data);
  }

  error(message, data = null) {
    return this.addLog('ERROR', message, data);
  }

  warn(message, data = null) {
    return this.addLog('WARN', message, data);
  }

  debug(message, data = null) {
    return this.addLog('DEBUG', message, data);
  }

  success(message, data = null) {
    return this.addLog('SUCCESS', message, data);
  }

  /**
   * Get all logs
   */
  getLogs(limit = 100) {
    return this.logs.slice(-limit);
  }

  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level) {
    return this.logs.filter((log) => log.level === level.toUpperCase());
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
    localStorage.removeItem('iot_dashboard_logs');
    this.info('Logs cleared');
  }

  /**
   * Get logs as formatted string (for download/export)
   */
  getLogsAsString() {
    return this.logs
      .map(
        (log) =>
          `[${log.timestamp}] [${log.level}] ${log.message} ${
            log.data ? JSON.stringify(log.data) : ''
          }`
      )
      .join('\n');
  }

  /**
   * Export logs as JSON file
   */
  exportLogs() {
    const dataStr = JSON.stringify(this.logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const element = document.createElement('a');
    element.href = url;
    element.download = `iot-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
export const logger = new Logger();
