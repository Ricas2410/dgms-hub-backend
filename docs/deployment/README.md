# DGMS Hub Deployment Guide

This guide provides step-by-step instructions for deploying the DGMS Hub system in production.

## System Requirements

### Server Requirements
- **OS**: Ubuntu 20.04 LTS or higher / CentOS 8 or higher
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 50GB minimum, SSD recommended
- **Network**: Static IP address, domain name

### Software Requirements
- **Node.js**: v16 or higher
- **PostgreSQL**: v12 or higher
- **Nginx**: Latest stable version
- **SSL Certificate**: Let's Encrypt or commercial certificate
- **PM2**: Process manager for Node.js

## Pre-deployment Setup

### 1. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git nginx postgresql postgresql-contrib

# Install Node.js (using NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Create application user
sudo useradd -m -s /bin/bash dgmshub
sudo usermod -aG sudo dgmshub
```

### 2. Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

-- Create database and user
CREATE DATABASE dgms_hub;
CREATE USER dgms_hub_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE dgms_hub TO dgms_hub_user;
ALTER USER dgms_hub_user CREATEDB;
\q

# Configure PostgreSQL (edit /etc/postgresql/*/main/postgresql.conf)
sudo nano /etc/postgresql/12/main/postgresql.conf
# Uncomment and modify: listen_addresses = 'localhost'

# Configure authentication (edit /etc/postgresql/*/main/pg_hba.conf)
sudo nano /etc/postgresql/12/main/pg_hba.conf
# Add: local   dgms_hub    dgms_hub_user                     md5

# Restart PostgreSQL
sudo systemctl restart postgresql
sudo systemctl enable postgresql
```

### 3. SSL Certificate Setup

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d admin.yourdomain.com
```

## Application Deployment

### 1. Clone and Setup Backend

```bash
# Switch to application user
sudo su - dgmshub

# Clone repository
git clone https://github.com/your-org/dgms-hub.git
cd dgms-hub

# Setup backend
cd backend
npm install --production

# Create environment file
cp .env.example .env
nano .env
```

Configure the `.env` file:
```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dgms_hub
DB_USER=dgms_hub_user
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
JWT_EXPIRES_IN=24h
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=change_this_password_immediately
```

```bash
# Initialize database
npm run migrate

# Create uploads directory
mkdir -p uploads
chmod 755 uploads

# Test the application
npm start
# Press Ctrl+C to stop after testing
```

### 2. Setup Admin Panel

```bash
# Setup admin panel
cd ../admin-panel
npm install

# Create environment file
echo "REACT_APP_API_URL=https://yourdomain.com/api" > .env.production

# Build the application
npm run build
```

### 3. Configure Process Manager

```bash
# Create PM2 ecosystem file
cd ~/dgms-hub
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'dgms-hub-backend',
    script: './backend/server.js',
    cwd: './backend',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024'
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command above
```

### 4. Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/dgms-hub
```

Add the following configuration:

```nginx
# Backend API server
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # API routes
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # File uploads
    location /uploads {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10M;
    }

    # Default response for mobile app API
    location / {
        return 200 '{"status":"DGMS Hub API Server","version":"1.0.0"}';
        add_header Content-Type application/json;
    }
}

# Admin Panel
server {
    listen 443 ssl http2;
    server_name admin.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL configuration (same as above)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    root /home/dgmshub/dgms-hub/admin-panel/build;
    index index.html;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy for admin panel
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com admin.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/dgms-hub /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## Security Configuration

### 1. Firewall Setup

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. Fail2Ban Setup

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Create custom configuration
sudo nano /etc/fail2ban/jail.local
```

Add the following configuration:

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
maxretry = 10
findtime = 600
bantime = 7200
```

```bash
# Start and enable Fail2Ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

## Post-Deployment Tasks

### 1. Initial Admin Setup

1. Access the admin panel at `https://admin.yourdomain.com`
2. Login with the default credentials (admin@yourdomain.com / admin123)
3. **Immediately change the default password**
4. Create additional admin users as needed
5. Add your school's web applications

### 2. Mobile App Configuration

Update the mobile app configuration to point to your production API:

```javascript
// mobile/src/services/api.js
const API_BASE_URL = 'https://yourdomain.com/api';
```

### 3. Monitoring Setup

```bash
# Setup log rotation
sudo nano /etc/logrotate.d/dgms-hub
```

Add the following:

```
/home/dgmshub/dgms-hub/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 dgmshub dgmshub
    postrotate
        pm2 reload dgms-hub-backend
    endscript
}
```

### 4. Backup Setup

```bash
# Create backup script
sudo nano /usr/local/bin/dgms-hub-backup.sh
```

Add the following script:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/dgms-hub"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -h localhost -U dgms_hub_user dgms_hub > $BACKUP_DIR/database_$DATE.sql

# Application files backup
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /home/dgmshub/dgms-hub/backend uploads/

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
# Make script executable
sudo chmod +x /usr/local/bin/dgms-hub-backup.sh

# Setup daily backup cron job
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/dgms-hub-backup.sh >> /var/log/dgms-hub-backup.log 2>&1
```

## Maintenance

### Regular Tasks

1. **Weekly**: Check application logs and system resources
2. **Monthly**: Update system packages and restart services
3. **Quarterly**: Review and rotate SSL certificates
4. **Annually**: Review security configurations and update dependencies

### Updating the Application

```bash
# Switch to application user
sudo su - dgmshub
cd dgms-hub

# Pull latest changes
git pull origin main

# Update backend
cd backend
npm install --production
npm run migrate

# Update admin panel
cd ../admin-panel
npm install
npm run build

# Restart application
pm2 restart dgms-hub-backend
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**: Check PostgreSQL service and credentials
2. **SSL Certificate Issues**: Verify certificate paths and renewal
3. **File Upload Issues**: Check directory permissions and disk space
4. **Performance Issues**: Monitor CPU, memory, and database performance

### Log Locations

- **Application Logs**: `/home/dgmshub/dgms-hub/logs/`
- **Nginx Logs**: `/var/log/nginx/`
- **PostgreSQL Logs**: `/var/log/postgresql/`
- **System Logs**: `/var/log/syslog`

For additional support, contact the DGMS IT Department.
