const express = require('express');
const router = express.Router();
const dataStore = require('../dataStore');

// GET all alerts
router.get('/', async (req, res) => {
  try {
    const alerts = await dataStore.getAllAlerts();
    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create alert
router.post('/', async (req, res) => {
  try {
    const { title, message, type, routeId } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'Title and message are required' });
    }

    const newAlert = await dataStore.createAlert({
      title,
      message,
      type: type || 'INFO',
      routeId: routeId || null
    });

    req.app.get('io')?.emit('alert_created', newAlert);

    res.status(201).json({ success: true, data: newAlert });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE alert
router.delete('/:id', async (req, res) => {
  try {
    const success = await dataStore.deleteAlert(req.params.id);
    if (!success) return res.status(404).json({ success: false, error: 'Alert not found' });

    req.app.get('io')?.emit('alert_deleted', { id: req.params.id });
    res.json({ success: true, message: 'Alert deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
