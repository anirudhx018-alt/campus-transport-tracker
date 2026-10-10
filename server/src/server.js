require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const { connectDB } = require('./db');
const dataStore = require('./dataStore');
const simulationService = require('./services/simulationService');

// Route Handlers
const busRoutes = require('./routes/buses');
const routeRoutes = require('./routes/routes');
const stopRoutes = require('./routes/stops');
const alertRoutes = require('./routes/alerts');
const statRoutes = require('./routes/stats');
const simulationRoutes = require('./routes/simulation');

const app = express();
const server = http.createServer(app);

// Socket.io configuration with CORS support
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Attach io to express app so routes can broadcast events
app.set('io', io);

// Mount API Endpoints
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/stats', statRoutes);
app.use('/api/simulation', simulationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    simulation: simulationService.getStatus()
  });
});

// Serve frontend static build if present
const path = require('path');
const fs = require('fs');
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
  console.log(`📦 [Static] Serving client UI from ${clientDistPath}`);
}

// Real-Time Socket Connection Handlers
io.on('connection', async (socket) => {
  console.log(`🔌 [Socket.io] Client connected: ${socket.id}`);

  // Send immediate snapshot of buses and routes on connection
  try {
    const [buses, routes, stops, alerts] = await Promise.all([
      dataStore.getAllBuses(),
      dataStore.getAllRoutes(),
      dataStore.getAllStops(),
      dataStore.getAllAlerts()
    ]);

    socket.emit('initial_state', {
      buses,
      routes,
      stops,
      alerts,
      simulation: simulationService.getStatus()
    });
  } catch (err) {
    console.error('Error sending initial socket state:', err.message);
  }

  socket.on('disconnect', () => {
    console.log(`❌ [Socket.io] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    // Connect to MongoDB or activate fallback mode
    await connectDB();

    // Populate initial campus dataset
    await dataStore.seedInitialData();

    // Initialize real-time simulation service
    simulationService.initialize(io);

    server.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚌 Campus Transport Tracking Server running on port ${PORT}`);
      console.log(`📡 WebSocket server active & broadcasting`);
      console.log(`🌐 API base: http://localhost:${PORT}/api`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Fatal bootstrap failure:', err);
    process.exit(1);
  }
}

bootstrap();
