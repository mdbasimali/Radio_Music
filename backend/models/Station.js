const mongoose = require('mongoose');

const StationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    language: { type: String, required: true },
    description: String,
    color: String,
    streamUrl: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Station', StationSchema);
