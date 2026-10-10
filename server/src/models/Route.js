const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  color: { type: String, default: '#3B82F6' },
  description: { type: String, default: '' },
  stops: [{
    stopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop', required: true },
    order: { type: Number, required: true },
    stopDurationMin: { type: Number, default: 2 }
  }],
  pathCoordinates: {
    type: [[Number]], // Array of [lat, lng]
    default: []
  },
  schedule: {
    startTime: { type: String, default: '07:00 AM' },
    endTime: { type: String, default: '10:00 PM' },
    frequencyMinutes: { type: Number, default: 15 }
  },
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now }
});

const Route = mongoose.models.Route || mongoose.model('Route', routeSchema);

module.exports = Route;
