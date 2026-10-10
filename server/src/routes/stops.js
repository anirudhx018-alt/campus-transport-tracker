const express = require('express');
const router = express.Router();
const dataStore = require('../dataStore');

// GET all stops
router.get('/', async (req, res) => {
  try {
    const stops = await dataStore.getAllStops();
    res.json({ success: true, data: stops });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET stop by ID
router.get('/:id', async (req, res) => {
  try {
    const stop = await dataStore.getStopById(req.params.id);
    if (!stop) return res.status(404).json({ success: false, error: 'Stop not found' });
    res.json({ success: true, data: stop });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create stop
router.post('/', async (req, res) => {
  try {
    const { name, code, lat, lng, hasShelter, landmark, description } = req.body;
    if (!name || !code || lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, error: 'Name, code, latitude, and longitude are required' });
    }

    const newStop = await dataStore.createStop({
      name,
      code,
      lat: Number(lat),
      lng: Number(lng),
      hasShelter: hasShelter !== undefined ? Boolean(hasShelter) : true,
      landmark: landmark || '',
      description: description || ''
    });

    req.app.get('io')?.emit('stop_created', newStop);

    res.status(201).json({ success: true, data: newStop });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update stop
router.put('/:id', async (req, res) => {
  try {
    const updated = await dataStore.updateStop(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Stop not found' });

    req.app.get('io')?.emit('stop_updated', updated);

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE stop
router.delete('/:id', async (req, res) => {
  try {
    const success = await dataStore.deleteStop(req.params.id);
    if (!success) return res.status(404).json({ success: false, error: 'Stop not found' });

    req.app.get('io')?.emit('stop_deleted', { id: req.params.id });
    res.json({ success: true, message: 'Stop deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
