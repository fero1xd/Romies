const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  cover_url: { type: String, default: null },
  description: { type: String, default: null },
  rating: Number,
  title: { type: String, default: null },
});

module.exports = mongoose.model('movies', movieSchema);
