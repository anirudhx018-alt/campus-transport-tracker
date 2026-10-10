const express = require('express');
const router = express.Router();
const dataStore = require('../dataStore');

// GET all routes
router.get('/', async (req, res) => {
  try {
    const routes = await dataStore.getAllRoutes();
    res.json({ success: true, data: routes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET route by ID
router.get('/:id', async (req, res) => {
  try {
    const route = await dataStore.getRouteById(req.params.id);
    if (!route) return res.status(404).json({ success: false, error: 'Route not found' });
    res.json({ success: true, data: route });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create route
router.post('/', async (req, res) => {
  try {
    const { name, code, color, description, stops, pathCoordinates, schedule, status } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, error: 'Route name and code are required' });
    }

    const newRoute = await dataStore.createRoute({
      name,
      code,
      color: color || '#3B82F6',
      description: description || '',
      stops: stops || [],
      pathCoordinates: pathCoordinates || [],
      schedule: schedule || { startTime: '07:00 AM', endTime: '10:00 PM', frequencyMinutes: 15 },
      status: status || 'ACTIVE'
    });

    const populated = await dataStore.getRouteById(newRoute._id);
    req.app.get('io')?.emit('route_created', populated);

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update route
router.put('/:id', async (req, res) => {
  try {
    const updated = await dataStore.updateRoute(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Route not found' });

    const populated = await dataStore.getRouteById(req.params.id);
    req.app.get('io')?.emit('route_updated', populated);

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE route
router.delete('/:id', async (req, res) => {
  try {
    const success = await dataStore.deleteRoute(req.params.id);
    if (!success) return res.status(404).json({ success: false, error: 'Route not found' });

    req.app.get('io')?.emit('route_deleted', { id: req.params.id });
    res.json({ success: true, message: 'Route deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
