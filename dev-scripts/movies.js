let movies = require('./movies.json');

movies = movies.map((movie) => {
  delete movie.id;
  return movie;
});

module.exports = movies;
