const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');
const allowCors = require('cors');

const app = express();

// Cors midleware
app.use(allowCors());

// Body parser midleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Config
const db = require('./config/keys').mongoURI;

// Connect MongoDB
mongoose
  .connect(db)
  .then(() => console.log('MongoDB connected.'))
  .catch(err => console.log(err));

// Passport midleware
app.use(passport.initialize());

// Passport config
require('./config/passport')(passport);

// Use Routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const port = process.dev || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
