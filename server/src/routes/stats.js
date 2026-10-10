const express = require('express');
const router = express.Router();
const dataStore = require('../dataStore');
const { getDatabaseStatus } = require('../db');

// GET campus transport analytics & system status
router.get('/', async (req, res) => {
  try {
    const [buses, routes, stops, alerts] = await Promise.all([
      dataStore.getAllBuses(),
      dataStore.getAllRoutes(),
      dataStore.getAllStops(),
      dataStore.getAllAlerts()
    ]);

    const activeBuses = buses.filter(b => b.status === 'IN_TRANSIT' || b.status === 'STOPPED' || b.status === 'ACTIVE');
    const maintenanceBuses = buses.filter(b => b.status === 'MAINTENANCE');
    const idleBuses = buses.filter(b => b.status === 'IDLE');

    const totalCapacity = buses.reduce((acc, b) => acc + (b.capacity || 0), 0);
    const totalPassengers = buses.reduce((acc, b) => acc + (b.currentOccupancy || 0), 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((totalPassengers / totalCapacity) * 100) : 0;

    res.json({
      success: true,
      data: {
        fleet: {
          totalBuses: buses.length,
          activeBuses: activeBuses.length,
          maintenanceBuses: maintenanceBuses.length,
          idleBuses: idleBuses.length,
          totalCapacity,
          totalPassengers,
          occupancyRate
        },
        routes: {
          totalRoutes: routes.length,
          activeRoutes: routes.filter(r => r.status === 'ACTIVE').length
        },
        stops: {
          totalStops: stops.length,
          shelteredStops: stops.filter(s => s.hasShelter).length
        },
        alerts: {
          totalAlerts: alerts.length,
          activeAlerts: alerts.slice(0, 5)
        },
        system: getDatabaseStatus()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
