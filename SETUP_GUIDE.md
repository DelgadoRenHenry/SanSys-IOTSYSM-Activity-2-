# Smart Agriculture IoT Dashboard - Setup Guide

This guide will walk you through setting up and running the React frontend dashboard.

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (optional, for cloning)
- **Backend API server** running (PHP/MySQL)
- **Text editor** (VS Code recommended)

## ✅ Step-by-Step Installation

### Step 1: Navigate to Project Directory

```bash
cd SanSys-IOTSYSM-Activity-2-
```

### Step 2: Verify Node.js Installation

```bash
node --version
npm --version
```

You should see version numbers. If not, install Node.js from [nodejs.org](https://nodejs.org/)

### Step 3: Install Dependencies

```bash
npm install
```

This will download and install all required packages (may take 2-3 minutes).

**Packages installed:**
- react & react-dom
- axios (for API calls)
- bootstrap & react-bootstrap (UI framework)
- recharts (charts)
- date-fns (date formatting)
- @fortawesome (icons)

### Step 4: Create Environment Configuration

```bash
# Copy the example .env file
cp .env.example .env

# On Windows, if cp doesn't work:
# copy .env.example .env
```

### Step 5: Configure API Connection

Open `.env` file in your text editor:

```env
# Backend API URL - IMPORTANT: Change this to your backend server URL
REACT_APP_API_URL=http://localhost:8000/api

# Debug mode (true/false)
REACT_APP_DEBUG=true

# Use mock data when API unavailable (true/false)
REACT_APP_USE_MOCK_DATA=true
```

**Update `REACT_APP_API_URL` to match your backend server:**
- Local development: `http://localhost:8000/api`
- Remote server: `http://192.168.x.x:8000/api` or domain
- Production: `https://your-domain.com/api`

### Step 6: Start Development Server

```bash
npm start
```

Output should show:
```
Compiled successfully!

You can now view smart-agriculture-iot-dashboard in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
```

### Step 7: Open in Browser

The application should open automatically at `http://localhost:3000`

If not, manually open: http://localhost:3000

## 🔍 Verifying Installation

### Dashboard Loads Successfully
✅ You should see the dashboard with:
- Header: "Smart Agriculture IoT Dashboard"
- Four summary cards (Total, Active, Inactive, Average Conditions)
- Sensor data table
- Search and filter controls

### API Connection Working
✅ Check browser console (F12 → Console) for log messages:
- "Application started"
- "Fetching all sensors from API"
- "Successfully fetched all sensors"

### With Mock Data (if API unavailable)
✅ If API fails, you'll see:
- Alert: "Unable to fetch live data: ... Showing demo data."
- Sample sensor data displayed
- All features working normally

## 🔧 Common Setup Issues

### Issue: "npm: command not found"
**Solution**: Node.js not installed
```bash
# Download and install Node.js
# https://nodejs.org/
# Then open a new terminal and try npm install again
```

### Issue: "Port 3000 already in use"
**Solution**: Another process using port 3000
```bash
# Windows PowerShell
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

### Issue: "Cannot find module"
**Solution**: Dependencies not installed
```bash
npm install
# Clear npm cache if persistent:
npm cache clean --force
npm install
```

### Issue: "API connection refused"
**Solution**: Backend API not running
- Verify backend server is running
- Check `REACT_APP_API_URL` in `.env`
- Verify backend port (usually 8000)
- Check CORS configuration on backend
- Try accessing API directly: `http://localhost:8000/api/sensors`

### Issue: "CORS error in console"
**Solution**: Backend CORS not enabled
- Ensure backend PHP API has CORS headers:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
```

## 📖 Project Structure Overview

```
src/
├── components/
│   ├── Dashboard.js          ← Main dashboard interface
│   ├── SensorDataTable.js    ← Table with search/filter/sort
│   ├── SensorDetailModal.js  ← Detailed view modal
│   ├── SensorCharts.js       ← Charts for trends
│   └── StatusIndicator.js    ← Status badge component
│
├── services/
│   ├── apiService.js         ← API communication
│   └── logger.js             ← Logging system
│
├── utils/
│   └── helpers.js            ← Utility functions
│
├── App.js                    ← Main app component
├── App.css                   ← App styles
├── index.js                  ← Entry point
└── index.css                 ← Global styles
```

## 🚀 Building for Production

When ready to deploy:

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

**What the build does:**
- Minifies JavaScript
- Optimizes images
- Creates production-ready files
- Reduces bundle size

**To deploy the build:**
1. Upload `build/` folder contents to web server
2. Configure server to serve `index.html` for all routes
3. Update `.env` production API URL in configuration

## 📱 Testing on Different Devices

### Local Network Testing
After starting the app, you can access it from other devices:

```
http://<your-computer-ip>:3000
```

Find your IP:
```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
```

### Mobile Device Testing
1. Connect phone to same WiFi network
2. Open browser on phone
3. Navigate to `http://<your-computer-ip>:3000`

## 🔍 Debugging

### Check Logs in Browser

**F12 → Console tab shows:**
- Application initialization
- API call logs
- Error messages
- Data loading progress

### Check API Responses

**F12 → Network tab shows:**
- API requests to backend
- Response status (200 = success)
- Response data
- Request headers

### Check Stored Logs

**F12 → Application tab → Local Storage:**
- Click on `http://localhost:3000`
- Look for `iot_dashboard_logs`
- Contains all system logs

### Export System Logs

Press F12 and run in console:
```javascript
import { logger } from './services/logger';
logger.exportLogs();
```

This downloads a JSON file with all system logs.

## 🚦 Development Workflow

### Making Changes

1. Edit files in `src/` folder
2. Save (Ctrl+S / Cmd+S)
3. Browser automatically refreshes
4. Check console for any errors

### Restarting Development Server

```bash
# Stop current server: Ctrl+C
# Then restart:
npm start
```

### Troubleshooting Changes

- Clear browser cache: Ctrl+Shift+Delete
- Hard refresh: Ctrl+Shift+R
- Clear localStorage:

```javascript
// Run in browser console (F12)
localStorage.clear();
```

## 🎯 Next Steps

1. ✅ Installation complete
2. ✅ Dashboard running
3. ✅ Connected to backend API
4. 📊 Start monitoring sensors!

## 📞 Getting Help

If you encounter issues:

1. **Check the logs**
   - Browser console (F12 → Console)
   - Application logs (localStorage)

2. **Verify configuration**
   - Check `.env` file
   - Verify backend API running
   - Test API directly in browser

3. **Review documentation**
   - See main README.md
   - Check API integration section
   - Review troubleshooting guide

4. **Common fixes**
   - Restart development server
   - Clear browser cache
   - Reinstall dependencies: `npm install`

## 📝 Environment Configuration Reference

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8000/api

# Debug Mode
# Set to true to see verbose logging in console
REACT_APP_DEBUG=true

# Mock Data
# Set to true to use demo data when API unavailable
REACT_APP_USE_MOCK_DATA=true
```

## ✨ Features Ready to Use

✅ Dashboard with summary statistics
✅ Real-time sensor data table
✅ Search and filtering
✅ Sorting capabilities
✅ Detailed sensor view
✅ Historical data charts
✅ Auto-refresh every 5 seconds
✅ Comprehensive logging
✅ Responsive design
✅ Error handling with fallbacks

---

**Now you're ready to use the Smart Agriculture IoT Dashboard!**

For detailed feature documentation, see [README.md](./README.md)
