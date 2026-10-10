const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  hasShelter: { type: Boolean, default: true },
  landmark: { type: String, default: '' },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Stop = mongoose.models.Stop || mongoose.model('Stop', stopSchema);

module.exports = Stop;
