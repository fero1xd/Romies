const mongoose = require('mongoose');
const Movies = require('../models/movieModel');
const movies = require('./movies');

mongoose
  .connect(process.env.DBURL)
  .then(() => console.log('DB connection successful!'));

const importMovies = async () => {
  await Movies.create(movies);
};

importMovies();
