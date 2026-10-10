const mongoose = require('mongoose');
const { isFallback, memoryStore } = require('./db');
const Stop = require('./models/Stop');
const Route = require('./models/Route');
const Bus = require('./models/Bus');
const Alert = require('./models/Alert');
const { stopsData, routesData, busesData, alertsData } = require('./data/seedData');

// Helper to generate a 24-char hex ID if needed
function generateId() {
  return new mongoose.Types.ObjectId().toString();
}

// Deep clone helper
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Seed the database or memory store
async function seedInitialData() {
  if (isFallback()) {
    console.log('[Store] Initializing Memory Store with Campus Dataset...');
    stopsData.forEach(s => memoryStore.stops.set(s._id, clone(s)));
    routesData.forEach(r => memoryStore.routes.set(r._id, clone(r)));
    busesData.forEach(b => memoryStore.buses.set(b._id, clone(b)));
    alertsData.forEach(a => memoryStore.alerts.set(a._id, clone(a)));
    console.log(`[Store] Seeded ${memoryStore.stops.size} stops, ${memoryStore.routes.size} routes, ${memoryStore.buses.size} buses.`);
    return;
  }

  // Mongoose connected mode
  try {
    const stopCount = await Stop.countDocuments();
    if (stopCount === 0) {
      console.log('[Store] Populating MongoDB with initial campus dataset...');
      await Stop.insertMany(stopsData);
      await Route.insertMany(routesData);
      await Bus.insertMany(busesData);
      await Alert.insertMany(alertsData);
      console.log('✅ [Store] MongoDB seeded successfully.');
    } else {
      console.log(`[Store] MongoDB already contains ${stopCount} stops.`);
    }
  } catch (err) {
    console.error('[Store] Error seeding MongoDB:', err.message);
  }
}

// STOPS OPERATIONS
async function getAllStops() {
  if (isFallback()) {
    return Array.from(memoryStore.stops.values());
  }
  return await Stop.find().sort({ name: 1 }).lean();
}

async function getStopById(id) {
  if (isFallback()) {
    return memoryStore.stops.get(id.toString()) || null;
  }
  return await Stop.findById(id).lean();
}

async function createStop(data) {
  if (isFallback()) {
    const id = data._id || generateId();
    const newStop = { ...data, _id: id, createdAt: new Date() };
    memoryStore.stops.set(id, newStop);
    return newStop;
  }
  const stop = new Stop(data);
  return (await stop.save()).toObject();
}

async function updateStop(id, data) {
  if (isFallback()) {
    const existing = memoryStore.stops.get(id.toString());
    if (!existing) return null;
    const updated = { ...existing, ...data };
    memoryStore.stops.set(id.toString(), updated);
    return updated;
  }
  return await Stop.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
}

async function deleteStop(id) {
  if (isFallback()) {
    const exists = memoryStore.stops.has(id.toString());
    if (exists) {
      memoryStore.stops.delete(id.toString());
      // Remove stop reference from routes
      for (const [rId, route] of memoryStore.routes.entries()) {
        route.stops = route.stops.filter(s => s.stopId?.toString() !== id.toString());
        memoryStore.routes.set(rId, route);
      }
    }
    return exists;
  }
  const deleted = await Stop.findByIdAndDelete(id);
  if (deleted) {
    await Route.updateMany(
      {},
      { $pull: { stops: { stopId: id } } }
    );
  }
  return !!deleted;
}

// ROUTES OPERATIONS
async function getAllRoutes() {
  if (isFallback()) {
    const routes = Array.from(memoryStore.routes.values()).map(r => {
      const populated = clone(r);
      populated.stops = (populated.stops || []).map(st => {
        const stopObj = memoryStore.stops.get(st.stopId?.toString() || st.stopId);
        return {
          ...st,
          stop: stopObj || null
        };
      });
      return populated;
    });
    return routes;
  }
  return await Route.find().populate('stops.stopId').lean();
}

async function getRouteById(id) {
  if (isFallback()) {
    const route = memoryStore.routes.get(id.toString());
    if (!route) return null;
    const populated = clone(route);
    populated.stops = (populated.stops || []).map(st => ({
      ...st,
      stop: memoryStore.stops.get(st.stopId?.toString() || st.stopId) || null
    }));
    return populated;
  }
  return await Route.findById(id).populate('stops.stopId').lean();
}

async function createRoute(data) {
  if (isFallback()) {
    const id = data._id || generateId();
    const newRoute = {
      ...data,
      _id: id,
      stops: data.stops || [],
      pathCoordinates: data.pathCoordinates || [],
      createdAt: new Date()
    };
    memoryStore.routes.set(id, newRoute);
    return newRoute;
  }
  const route = new Route(data);
  return (await route.save()).toObject();
}

async function updateRoute(id, data) {
  if (isFallback()) {
    const existing = memoryStore.routes.get(id.toString());
    if (!existing) return null;
    const updated = { ...existing, ...data };
    memoryStore.routes.set(id.toString(), updated);
    return updated;
  }
  return await Route.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
}

async function deleteRoute(id) {
  if (isFallback()) {
    const exists = memoryStore.routes.has(id.toString());
    if (exists) {
      memoryStore.routes.delete(id.toString());
      // Unassign buses on this route
      for (const [bId, bus] of memoryStore.buses.entries()) {
        if (bus.routeId?.toString() === id.toString()) {
          bus.routeId = null;
          bus.status = 'IDLE';
          memoryStore.buses.set(bId, bus);
        }
      }
    }
    return exists;
  }
  const deleted = await Route.findByIdAndDelete(id);
  if (deleted) {
    await Bus.updateMany({ routeId: id }, { routeId: null, status: 'IDLE' });
  }
  return !!deleted;
}

// BUSES OPERATIONS
async function getAllBuses() {
  if (isFallback()) {
    const buses = Array.from(memoryStore.buses.values()).map(b => {
      const populated = clone(b);
      if (populated.routeId) {
        populated.route = memoryStore.routes.get(populated.routeId.toString()) || null;
      }
      if (populated.nextStopId) {
        populated.nextStop = memoryStore.stops.get(populated.nextStopId.toString()) || null;
      }
      return populated;
    });
    return buses;
  }
  return await Bus.find().populate('routeId').populate('nextStopId').lean();
}

async function getBusById(id) {
  if (isFallback()) {
    const bus = memoryStore.buses.get(id.toString());
    if (!bus) return null;
    const populated = clone(bus);
    if (populated.routeId) {
      populated.route = memoryStore.routes.get(populated.routeId.toString()) || null;
    }
    if (populated.nextStopId) {
      populated.nextStop = memoryStore.stops.get(populated.nextStopId.toString()) || null;
    }
    return populated;
  }
  return await Bus.findById(id).populate('routeId').populate('nextStopId').lean();
}

async function createBus(data) {
  if (isFallback()) {
    const id = data._id || generateId();
    const newBus = {
      _id: id,
      busNumber: data.busNumber,
      plateNumber: data.plateNumber,
      capacity: Number(data.capacity) || 40,
      currentOccupancy: Number(data.currentOccupancy) || 0,
      driverName: data.driverName || 'Unassigned',
      driverPhone: data.driverPhone || '',
      status: data.status || 'ACTIVE',
      routeId: data.routeId || null,
      currentLocation: data.currentLocation || { lat: 37.4295, lng: -122.1700, heading: 0, speed: 0 },
      currentWaypointIndex: 0,
      nextStopId: data.nextStopId || null,
      etaMinutes: 0,
      updatedAt: new Date()
    };
    memoryStore.buses.set(id, newBus);
    return newBus;
  }
  const bus = new Bus(data);
  return (await bus.save()).toObject();
}

async function updateBus(id, data) {
  if (isFallback()) {
    const existing = memoryStore.buses.get(id.toString());
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    memoryStore.buses.set(id.toString(), updated);
    return updated;
  }
  return await Bus.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true, runValidators: true }).lean();
}

async function deleteBus(id) {
  if (isFallback()) {
    return memoryStore.buses.delete(id.toString());
  }
  const deleted = await Bus.findByIdAndDelete(id);
  return !!deleted;
}

// ALERTS OPERATIONS
async function getAllAlerts() {
  if (isFallback()) {
    return Array.from(memoryStore.alerts.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return await Alert.find().populate('routeId').sort({ createdAt: -1 }).lean();
}

async function createAlert(data) {
  if (isFallback()) {
    const id = data._id || generateId();
    const newAlert = {
      ...data,
      _id: id,
      createdAt: new Date()
    };
    memoryStore.alerts.set(id, newAlert);
    return newAlert;
  }
  const alert = new Alert(data);
  return (await alert.save()).toObject();
}

async function deleteAlert(id) {
  if (isFallback()) {
    return memoryStore.alerts.delete(id.toString());
  }
  const deleted = await Alert.findByIdAndDelete(id);
  return !!deleted;
}

module.exports = {
  seedInitialData,
  // Stops
  getAllStops,
  getStopById,
  createStop,
  updateStop,
  deleteStop,
  // Routes
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  // Buses
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
  // Alerts
  getAllAlerts,
  createAlert,
  deleteAlert
};
