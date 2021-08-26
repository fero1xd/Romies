const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Movie = require('../models/movieModel');
const app = express();
const connectDB = require('../utils/connectDB');
const movieRoute = require('../routes/api/movies');
const userRoute = require('../routes/api/users');
const auth = require('../middleware/auth');
const { authLimiter, mainLimiter } = require('../utils/limiters');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');
const compression = require('compression');

// CONNECTING TO DB
connectDB();

//MIDDLWARES
app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));

// CORS
app.use(cors());

// Security
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(compression());

app.use('/api/v1/movies', mainLimiter, auth, movieRoute);
app.use('/api/v1/users', authLimiter, userRoute);

app.listen(3000, () => {
  console.log('App started on port 3000');
});
