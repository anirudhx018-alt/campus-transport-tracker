const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  plateNumber: { type: String, required: true, trim: true },
  capacity: { type: Number, default: 40 },
  currentOccupancy: { type: Number, default: 0 },
  driverName: { type: String, default: 'Unassigned', trim: true },
  driverPhone: { type: String, default: '', trim: true },
  status: {
    type: String,
    enum: ['ACTIVE', 'IN_TRANSIT', 'STOPPED', 'MAINTENANCE', 'IDLE'],
    default: 'ACTIVE'
  },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null },
  currentLocation: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
    heading: { type: Number, default: 0 },
    speed: { type: Number, default: 0 }
  },
  currentWaypointIndex: { type: Number, default: 0 },
  nextStopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop', default: null },
  etaMinutes: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

const Bus = mongoose.models.Bus || mongoose.model('Bus', busSchema);

module.exports = Bus;
