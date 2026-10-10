const express = require('express');
const router = express.Router();
const simulationService = require('../services/simulationService');

// GET simulation status
router.get('/status', (req, res) => {
  res.json({ success: true, data: simulationService.getStatus() });
});

// POST start simulation
router.post('/start', (req, res) => {
  simulationService.start();
  res.json({ success: true, message: 'Simulation started', data: simulationService.getStatus() });
});

// POST pause simulation
router.post('/pause', (req, res) => {
  simulationService.pause();
  res.json({ success: true, message: 'Simulation paused', data: simulationService.getStatus() });
});

// POST set speed
router.post('/speed', (req, res) => {
  const { multiplier } = req.body;
  simulationService.setSpeed(multiplier);
  res.json({ success: true, message: `Speed set to ${simulationService.speedMultiplier}x`, data: simulationService.getStatus() });
});

// POST reset simulation positions
router.post('/reset', async (req, res) => {
  try {
    await simulationService.reset();
    res.json({ success: true, message: 'Simulation reset to default route positions' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
