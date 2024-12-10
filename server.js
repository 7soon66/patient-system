// Load environment variables
const dotenv = require('dotenv')
dotenv.config()

// Import dependencies
const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const methodOverride = require('method-override')
const morgan = require('morgan')
const multer = require('multer')
const path = require('path')

// Import models
const Department = require('./models/department')
const Urgency = require('./models/urgency')


// upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './usersImage')
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

// Import middleware
const passUsertoView = require('./middleware/pass-user-to-view')
const isSignedIn = require('./middleware/is-signed-in')

// Import controllers
const authCtrl = require('./controllers/auth.js')
const departmentCtrl = require('./controllers/departments.js')
const patientCtrl = require('./controllers/patients.js')
const profilePictureRoutes = require('./controllers/profilePictures')
// Initialize Express app
const app = express()

// Configure port
const PORT = process.env.PORT || 4000

app.use(express.static('public'));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log(`Connected to MongoDB Database: ${mongoose.connection.name}.`)

    // await Department.initialize()
    // await Urgency.initialize()

    // // Start the server
    // app.listen(PORT, () => {
    //   console.log(`The Express app is running on port ${PORT}`)
    // })
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err)
  })

// Middleware setup
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))
app.use(morgan('dev'))

app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  })
)
app.use(passUsertoView)
app.use('/profile-pictures', profilePictureRoutes)
app.use('/uploads', express.static('public/uploads'))
// Set view engine
app.set('view engine', 'ejs')

// Use controllers
app.use('/auth', authCtrl)
app.use('/departments', departmentCtrl)
app.use('/patients', patientCtrl)


// Root route
app.get('/', (req, res) => {
  res.render('index.ejs');
});


// upload 
app.get('/upload', (req, res) => {
  res.render('upload')
})

app.post('/upload', upload.single('image'), (req, res) => {
  res.send('Image Upload')
})

// Start server
app.listen(PORT, () => {
  console.log(`The Express app is running on port ${PORT}`);
});
