const express = require('express')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const Patient = require('../models/patient')
const isSignedIn = require('../middleware/is-signed-in')
const router = express.Router()
// GET: sign-up form
router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up.ejs')
})

// POST: sign-up submission
router.post('/sign-up', async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  try {
    if (!username || !password || !confirmPassword) {
      return res.send('Username, password, and confirm password are required.');
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      return res.send('Passwords do not match.');
    }

    const patient = await Patient.findOne({ cprId: username });
    if (!patient) {
      return res.send('Invalid CPR ID.');
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.send('Username exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword, role: 'Patient' });
    res.redirect('/auth/sign-in');
  } catch (err) {
    console.error(err);
    res.send('Error signing up.'); // Consider providing more specific error messages for better user experience
  }
});

// GET: sign-in form
router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in.ejs')
})

// POST: sign-in submission
router.post('/sign-in', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username }); // Find user by username

    if (!user) {
      return res.send('Invalid username or CPR ID.'); // Inform about invalid username
    }

    const isMatch = await bcrypt.compare(password, user.password); // Compare password

    if (!isMatch) {
      return res.send('wrong info entred.'); // Inform about incorrect password
    }

    // Successful login logic
    req.session.user = user; // Store user data in session
    const redirectPath = user.role === 'Admin' ? '/' : '/patients/me'; // Redirect based on role

    res.redirect(redirectPath);
  } catch (err) {
    console.error(err);
    res.send('Error signing in.');
  }
});

// GET: sign-out
router.get('/sign-out', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/')
  })
})

// Profile route
router.get('/profile', isSignedIn, async (req, res) => {
  try {
    const isAdmin = req.session.user.role === 'Admin'

    const userOrPatient = isAdmin
      ? await User.findById(req.session.user._id)
      : await Patient.findOne({ cprId: req.session.user.username })

    if (!userOrPatient) {
      return res.send('User not found.');
    }
    req.session.user.profilePicture = userOrPatient.profilePicture?.data
      ? `/profile-picture/${userOrPatient._id}`
      : '/uploads/default-profile.png'

    res.locals.user = {
      ...userOrPatient.toObject(),
      profilePicture: req.session.user.profilePicture,
      role: req.session.user.role
    }

    res.render('profile.ejs', { user: res.locals.user })
  } catch (err) {
    console.error('Error loading profile page:', err);
    res.send('Internal Server Error.');
  }
})

// GET: Render the password reset form
router.get('/resetpass', (req, res) => {
  res.render('auth/resetpass.ejs')
})

// POST: Handle password reset submission
router.post('/resetpass', async (req, res) => {
  const { newPassword, confirmPassword } = req.body

  if (newPassword !== confirmPassword) {
    res.render('profile/resetpass', { error: 'Passwords do not match' })
  } else {
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    const user = await User.findByIdAndUpdate(
      req.session.user._id,
      {password:hashedPassword,
      }, {new: true}
    )

    res.redirect('/auth/profile')
  }
})

module.exports = router
