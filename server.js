const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');
const testAuthRoutes = require('./controllers/test-jwt');
const authRoutes = require('./controllers/auth');
const userRoutes = require('./controllers/user');
const verifyToken = require('./middleware/verify-token');

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(cors());
app.use(express.json());
app.use(logger('dev'));

// Routes go here
// Remove this before starting a new project
app.use('/test-jwt', testAuthRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Any routes below this would require AUTH
app.use(verifyToken);

app.listen(3000, () => {
  console.log('The express app is ready!');
});
