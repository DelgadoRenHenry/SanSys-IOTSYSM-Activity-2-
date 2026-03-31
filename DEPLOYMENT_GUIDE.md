# Deployment Guide

Complete guide for deploying the Smart Agriculture IoT Dashboard to production.

## Table of Contents

1. [Building for Production](#building-for-production)
2. [Deployment Options](#deployment-options)
3. [Environment Configuration](#environment-configuration)
4. [Server Setup](#server-setup)
5. [Security Considerations](#security-considerations)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Building for Production

### Step 1: Prepare for Production

Ensure all development code is tested and committed:

```bash
# Check git status
git status

# Commit any changes
git add .
git commit -m "Prepare for production deployment"
```

### Step 2: Optimize and Build

```bash
# Clean install dependencies (remove node_modules)
rm -rf node_modules package-lock.json
npm install

# Build optimized production bundle
npm run build
```

**What the build does:**
- Minifies JavaScript and CSS
- Optimizes images
- Removes development code
- Creates sourcemaps (optional)
- Outputs to `build/` folder
- Reduces bundle size by ~60-70%

**Build output:**
```
build/
├── static/
│   ├── css/
│   │   └── main.[hash].css
│   ├── js/
│   │   ├── main.[hash].js
│   │   └── [chunk hashes].js
│   └── media/
│       └── [images, fonts]
├── index.html
├── favicon.ico
└── manifest.json
```

### Step 3: Test Production Build Locally

```bash
# Install production server
npm install -g serve

# Serve production build
serve -s build

# Open browser to http://localhost:3000
```

Verify:
- ✅ Dashboard loads
- ✅ Data fetches correctly
- ✅ All features work
- ✅ No console errors
- ✅ Responsive design works
- ✅ API communication successful

---

## Deployment Options

### Option 1: Static Hosting (Recommended for Frontend Only)

**Platforms:** Netlify, Vercel, GitHub Pages, AWS S3+CloudFront

#### Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=build
```

**Netlify Configuration File** (`netlify.toml`):

```toml
[build]
  command = "npm run build"
  publish = "build"

[dev]
  command = "npm start"
  port = 3000

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

#### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Vercel Configuration** (`vercel.json`):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Option 2: Traditional Web Server

**Platforms:** Apache, Nginx, IIS

#### Nginx Setup

**Nginx Configuration** (`/etc/nginx/sites-available/iot-dashboard`):

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss;

    root /var/www/iot-dashboard/build;
    index index.html;

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache HTML files
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate";
    }
}
```

**Enable and restart Nginx:**

```bash
sudo ln -s /etc/nginx/sites-available/iot-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Apache Setup

**.htaccess** (in build folder):

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Rewrite everything else to index.html
  RewriteRule ^ index.html [QSA,L]
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Caching headers
<FilesMatch "\.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$">
    Header set Cache-Control "max-age=31536000, public"
</FilesMatch>

<FilesMatch "\.html$">
    Header set Cache-Control "max-age=0, public, must-revalidate"
</FilesMatch>
```

### Option 3: Docker Container

**Dockerfile:**

```dockerfile
# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
RUN npm install -g serve
WORKDIR /app
COPY --from=builder /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
```

**docker-compose.yml:**

```yaml
version: '3.8'
services:
  iot-dashboard:
    build: .
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://api.your-domain.com/api
      - REACT_APP_DEBUG=false
    restart: unless-stopped
```

**Build and run:**

```bash
docker build -t iot-dashboard .
docker run -p 3000:3000 -e REACT_APP_API_URL=http://api.your-domain.com/api iot-dashboard
```

### Option 4: Kubernetes

**kubernetes.yml:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: iot-dashboard
spec:
  replicas: 3
  selector:
    matchLabels:
      app: iot-dashboard
  template:
    metadata:
      labels:
        app: iot-dashboard
    spec:
      containers:
      - name: iot-dashboard
        image: your-registry/iot-dashboard:latest
        ports:
        - containerPort: 3000
        env:
        - name: REACT_APP_API_URL
          value: "https://api.your-domain.com/api"
        - name: REACT_APP_DEBUG
          value: "false"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: iot-dashboard-service
spec:
  selector:
    app: iot-dashboard
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

**Deploy:**

```bash
kubectl apply -f kubernetes.yml
```

---

## Environment Configuration

### Production .env File

```env
# API Configuration - IMPORTANT!
REACT_APP_API_URL=https://api.your-domain.com/api

# Debug Mode - Disable in production
REACT_APP_DEBUG=false

# Mock Data - Disable in production
REACT_APP_USE_MOCK_DATA=false
```

### Environment Variables by Stage

#### Development
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_DEBUG=true
REACT_APP_USE_MOCK_DATA=true
```

#### Staging
```env
REACT_APP_API_URL=https://staging-api.your-domain.com/api
REACT_APP_DEBUG=true
REACT_APP_USE_MOCK_DATA=false
```

#### Production
```env
REACT_APP_API_URL=https://api.your-domain.com/api
REACT_APP_DEBUG=false
REACT_APP_USE_MOCK_DATA=false
```

---

## Server Setup

### Prerequisites

- Domain name (e.g., dashboard.your-farm.com)
- SSL certificate (Let's Encrypt recommended)
- Hosting provider account
- Git repository access

### Step-by-Step Setup

#### 1. SSH into Server

```bash
ssh user@your-server.com
```

#### 2. Install Node.js and npm

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### 3. Clone Repository

```bash
cd /var/www
git clone https://github.com/your-repo/iot-dashboard.git
cd iot-dashboard
```

#### 4. Install Dependencies

```bash
npm ci  # Use ci for production (more reliable)
```

#### 5. Create Production Build

```bash
npm run build
```

#### 6. Setup SSL Certificate

```bash
# Using Let's Encrypt (free)
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com
```

#### 7. Configure Web Server (Nginx)

```bash
# Create symlink to site config
sudo ln -s /etc/nginx/sites-available/iot-dashboard /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 8. Setup Process Manager (PM2)

```bash
# Install PM2
sudo npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'iot-dashboard',
    script: 'serve',
    args: '-s build -l 3000',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      REACT_APP_API_URL: 'https://api.your-domain.com/api',
      REACT_APP_DEBUG: false,
      NODE_ENV: 'production'
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 startup hook
pm2 startup
pm2 save
```

#### 9. Setup Monitoring & Logs

```bash
# Install PM2 monitoring
pm2 monitor

# View logs
pm2 logs iot-dashboard

# Monitor dashboard (optional)
pm2 monit
```

---

## Security Considerations

### HTTPS/SSL Configuration

**Always use HTTPS in production:**

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    return 301 https://$server_name$request_uri;
}
```

### Security Headers

Add to your web server configuration:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
```

### CORS Configuration

Restrict API calls to your domain:

```
Access-Control-Allow-Origin: https://dashboard.your-domain.com
Access-Control-Allow-Methods: GET, OPTIONS
```

### Content Security Policy

In public/index.html:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'">
```

### Rate Limiting

Implement on API backend:

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;

location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    proxy_pass http://backend;
}
```

### Environment Security

**Never commit sensitive data:**

```bash
# Create .env.production (don't commit)
# Use environment variables from server
# SSH keys, API tokens, etc. should be on server only
```

---

## Monitoring & Maintenance

### Setup Monitoring

#### Application Monitoring

```javascript
// Add to App.js for production monitoring
if (process.env.NODE_ENV === 'production') {
  // Send logs to monitoring service
  const sendLogsToMonitoring = async () => {
    const logs = logger.getLogs();
    await fetch('https://monitoring.your-domain.com/logs', {
      method: 'POST',
      body: JSON.stringify(logs)
    });
  };
  
  setInterval(sendLogsToMonitoring, 60000); // Every minute
}
```

#### Server Monitoring

```bash
# Install monitoring tools
sudo apt-get install htop iotop nethogs

# Setup automated monitoring
sudo crontab -e
# Add: */5 * * * * /usr/local/bin/check_health.sh
```

### Performance Optimization

#### Caching Strategy

**Static assets (1 year):**
```nginx
Location /static/ {
    expires 1y;
}
```

**HTML files (no cache):**
```nginx
location ~* \.html$ {
    expires -1;
}
```

#### CDN Configuration

Use CDN for static assets:

```html
<!-- In public/index.html -->
<link rel="stylesheet" href="https://cdn.your-cdn.com/bootstrap.min.css">
<script src="https://cdn.your-cdn.com/chart.js"></script>
```

### Automated Backups

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/iot-dashboard"
DATE=$(date +%Y-%m-%d_%H-%M-%S)

# Backup database
mysqldump -u user -p password database > $BACKUP_DIR/db_$DATE.sql

# Backup application
cp -r /var/www/iot-dashboard /backups/app_$DATE/

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/ s3://backups.your-domain.com/ --recursive

echo "Backup completed: $DATE"
```

**Schedule with cron:**

```bash
# Backup daily at 2 AM
0 2 * * * /usr/local/bin/backup.sh
```

### Log Rotation

**Logrotate configuration** (`/etc/logrotate.d/iot-dashboard`):

```
/var/www/iot-dashboard/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
```

---

## Troubleshooting

### Application Not Loading

**Check:**
- ✅ Nginx/Apache running: `sudo systemctl status nginx`
- ✅ Process manager running: `pm2 status`
- ✅ Port accessible: `sudo netstat -tlnp | grep 3000`
- ✅ Logs for errors: `pm2 logs`
- ✅ DNS resolved: `nslookup your-domain.com`

### API Connection Failed

**Check:**
- ✅ API server running
- ✅ CORS configured on backend
- ✅ API URL in .env correct
- ✅ Firewall allows connection
- ✅ API ssl certificate valid

```bash
# Test API connectivity
curl https://api.your-domain.com/api/health
```

### High CPU/Memory Usage

**Investigation:**
```bash
# Monitor processes
top

# Check Node process
ps aux | grep node

# View PM2 stats
pm2 monit
```

**Solutions:**
- Increase server resources
- Enable clustering in PM2
- Optimize react bundle
- Check for memory leaks

### SSL Certificate Issues

**Renewal:**
```bash
sudo certbot renew --dry-run
sudo certbot renew
```

**Auto-renewal with cron:**
```bash
0 3 1 * * sudo certbot renew --quiet && sudo systemctl reload nginx
```

### Performance Issues

**Optimization:**
```bash
# Enable gzip compression
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# Minimize bundle size
npm run build --analyze

# Check bundle size
npm install -g bundle-phobia
bundle-phobia ./build/static/js/main.js
```

---

## Deployment Checklist

- [ ] Build tested locally
- [ ] Production build created
- [ ] .env configured for production
- [ ] SSL certificate installed
- [ ] Web server configured
- [ ] Process manager setup
- [ ] Monitoring enabled
- [ ] Logs configured
- [ ] Backups scheduled
- [ ] Security headers added
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Domain pointing to server
- [ ] CI/CD pipeline setup (optional)
- [ ] Smoke tests passed
- [ ] Performance tested
- [ ] Error handling verified
- [ ] API connectivity confirmed
- [ ] Mobile responsiveness tested
- [ ] Logging system verified

---

## CI/CD Setup (Optional)

**.github/workflows/deploy.yml:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/iot-dashboard
          git pull origin main
          npm ci
          npm run build
          pm2 restart iot-dashboard
```

---

**Last Updated**: March 31, 2024
**Status**: ✅ Production Ready

For detailed information, see other documentation files:
- [Setup Guide](./SETUP_GUIDE.md)
- [API Reference](./API_REFERENCE.md)
- [Logging Guide](./LOGGING_GUIDE.md)
