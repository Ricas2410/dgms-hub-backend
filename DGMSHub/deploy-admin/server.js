// DGMS Hub Admin Dashboard Server
// Simple Node.js server for data persistence

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Read data from file
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return { applications: [], categories: [], settings: {} };
  }
}

// Write data to file
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
}

// Handle requests
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const pathname = parsedUrl.pathname;

  // Set CORS headers
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  // Handle OPTIONS request
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API Routes
  if (pathname === '/api/applications' && method === 'GET') {
    // Get all applications
    const data = readData();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data.applications));
    
  } else if (pathname === '/api/applications' && method === 'POST') {
    // Add new application
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const newApp = JSON.parse(body);
        const data = readData();
        
        // Generate new ID
        const maxId = data.applications.length > 0 
          ? Math.max(...data.applications.map(app => app.id)) 
          : 0;
        newApp.id = maxId + 1;
        newApp.isActive = true;
        
        data.applications.push(newApp);
        data.settings.lastUpdated = new Date().toISOString();
        
        if (writeData(data)) {
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(newApp));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to save data' }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    
  } else if (pathname.startsWith('/api/applications/') && method === 'PUT') {
    // Update application
    const id = parseInt(pathname.split('/')[3]);
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const updatedApp = JSON.parse(body);
        const data = readData();
        
        const index = data.applications.findIndex(app => app.id === id);
        if (index !== -1) {
          data.applications[index] = { ...data.applications[index], ...updatedApp, id };
          data.settings.lastUpdated = new Date().toISOString();
          
          if (writeData(data)) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data.applications[index]));
          } else {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to save data' }));
          }
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Application not found' }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    
  } else if (pathname.startsWith('/api/applications/') && method === 'DELETE') {
    // Delete application
    const id = parseInt(pathname.split('/')[3]);
    const data = readData();
    
    const index = data.applications.findIndex(app => app.id === id);
    if (index !== -1) {
      data.applications.splice(index, 1);
      data.settings.lastUpdated = new Date().toISOString();
      
      if (writeData(data)) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Application deleted' }));
      } else {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to save data' }));
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Application not found' }));
    }
    
  } else if (pathname === '/api/sync' && method === 'GET') {
    // Sync endpoint for mobile app
    const data = readData();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      applications: data.applications.filter(app => app.isActive),
      lastUpdated: data.settings.lastUpdated
    }));
    
  } else {
    // 404 for unknown routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 DGMS Hub Admin API Server running on http://localhost:${PORT}`);
  console.log(`📊 Data file: ${DATA_FILE}`);
  console.log(`🔄 Endpoints:`);
  console.log(`   GET    /api/applications     - Get all applications`);
  console.log(`   POST   /api/applications     - Add new application`);
  console.log(`   PUT    /api/applications/:id - Update application`);
  console.log(`   DELETE /api/applications/:id - Delete application`);
  console.log(`   GET    /api/sync            - Sync data for mobile app`);
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down DGMS Hub Admin API Server...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});
