const express = require('express');
const router = express.Router();
const dataStore = require('../dataStore');

// GET all buses
router.get('/', async (req, res) => {
  try {
    const buses = await dataStore.getAllBuses();
    res.json({ success: true, data: buses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET bus by ID
router.get('/:id', async (req, res) => {
  try {
    const bus = await dataStore.getBusById(req.params.id);
    if (!bus) return res.status(404).json({ success: false, error: 'Bus not found' });
    res.json({ success: true, data: bus });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create bus
router.post('/', async (req, res) => {
  try {
    const { busNumber, plateNumber, capacity, driverName, driverPhone, status, routeId } = req.body;
    if (!busNumber || !plateNumber) {
      return res.status(400).json({ success: false, error: 'Bus number and plate number are required' });
    }

    const newBus = await dataStore.createBus({
      busNumber,
      plateNumber,
      capacity: Number(capacity) || 40,
      currentOccupancy: 0,
      driverName: driverName || 'Unassigned',
      driverPhone: driverPhone || '',
      status: status || 'IDLE',
      routeId: routeId || null,
      currentLocation: { lat: 37.4295, lng: -122.1700, heading: 0, speed: 0 }
    });

    const populated = await dataStore.getBusById(newBus._id);
    req.app.get('io')?.emit('bus_created', populated);

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update bus
router.put('/:id', async (req, res) => {
  try {
    const updated = await dataStore.updateBus(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Bus not found' });

    const populated = await dataStore.getBusById(req.params.id);
    req.app.get('io')?.emit('bus_updated', populated);

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH assign route
router.patch('/:id/route', async (req, res) => {
  try {
    const { routeId } = req.body;
    const updated = await dataStore.updateBus(req.params.id, {
      routeId: routeId || null,
      status: routeId ? 'IN_TRANSIT' : 'IDLE',
      currentWaypointIndex: 0
    });
    if (!updated) return res.status(404).json({ success: false, error: 'Bus not found' });

    const populated = await dataStore.getBusById(req.params.id);
    req.app.get('io')?.emit('bus_updated', populated);

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH toggle status (ACTIVE, IN_TRANSIT, MAINTENANCE, IDLE)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await dataStore.updateBus(req.params.id, { status });
    if (!updated) return res.status(404).json({ success: false, error: 'Bus not found' });

    const populated = await dataStore.getBusById(req.params.id);
    req.app.get('io')?.emit('bus_updated', populated);

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE bus
router.delete('/:id', async (req, res) => {
  try {
    const success = await dataStore.deleteBus(req.params.id);
    if (!success) return res.status(404).json({ success: false, error: 'Bus not found' });

    req.app.get('io')?.emit('bus_deleted', { id: req.params.id });
    res.json({ success: true, message: 'Bus deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
