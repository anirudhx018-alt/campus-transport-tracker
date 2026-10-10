const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['INFO', 'WARNING', 'DELAY', 'EMERGENCY'],
    default: 'INFO'
  },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null },
  createdAt: { type: Date, default: Date.now }
});

const Alert = mongoose.models.Alert || mongoose.model('Alert', alertSchema);

module.exports = Alert;
