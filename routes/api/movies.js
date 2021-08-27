const router = require('express').Router();
const Movie = require('../../models/movieModel');
// @desc    Get movies
// @access  private
// @route   /api/v1/movies
// @method  GET

router.get('/', async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach((field) => delete queryObj[field]);

    // Advanced filtering

    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/,
      (match) => `$${match}`
    );

    let query = Movie.find(JSON.parse(queryString));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    }

    // Limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(`${fields} -_id`);
    } else {
      query = query.select('-__v -_id');
    }

    // Pagination
    const limit = req.query.limit * 1 || 5;
    const page = req.query.page * 1 || 1;
    const skipIndex = (page - 1) * limit;

    query = query.skip(skipIndex).limit(limit);

    const movies = await query;

    // Getting some info
    const totalMovies = (await Movie.find()).length;
    const totalPages = Math.round(totalMovies / limit);
    const remainingPages = Math.round(totalPages - page);

    if (movies.length <= 0) {
      return res.status(400).json({
        status: 'fail',
        total: 0,
        totalPages,
        error: {
          message: 'No movies left',
        },
      });
    }

    res.json({
      status: 'success',
      total: (await Movie.find()).length,
      totalPages,
      remainingPages,
      page,
      limit,
      data: {
        movies,
      },
    });
  } catch (error) {
    console.log(error);
  }
});

router.get('/random', async (req, res) => {
  const movies = await Movie.find();

  const randomMovie = movies[Math.floor(Math.random() * movies.length)];

  res.json({
    status: 'success',
    total: 1,
    data: {
      movie: randomMovie,
    },
  });
});

module.exports = router;
