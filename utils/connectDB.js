const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

const connectDB = () =>
  mongoose
    .connect(process.env.DBURL)
    .then(() => console.log('DB connection successful!'));

module.exports = connectDB;
