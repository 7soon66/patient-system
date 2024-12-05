// Load environment variables
const dotenv = require('dotenv');
dotenv.config();

// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const methodOverride = require('method-override');
const morgan = require('morgan');

// Import middleware
const passUsertoView = require('./middleware/pass-user-to-view');
const isSignedIn = require('./middleware/is-signed-in');

// Import controllers
const authCtrl = require('./controllers/auth.js');
const departmentsController = require('./controllers/departments');

// Initialize Express app
const app = express();

// Configure port
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB Database: ${mongoose.connection.name}.`);
});

// Middleware setup
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passUsertoView);

// Set view engine
app.set('view engine', 'ejs');

// Use controllers
app.use('/auth', authCtrl);
app.use('/departments', departmentsController);

// Root route
app.get('/', (req, res) => {
  res.render('index.ejs');
});

// Start server
app.listen(PORT, () => {
  console.log(`The Express app is running on port ${PORT}`);
});
