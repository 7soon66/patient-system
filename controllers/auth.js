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
  const { username, password } = req.body
  try {
    if (!username || !password)
      return res.send('Username and password required.')

    const patient = await Patient.findOne({ cprId: username })
    if (!patient) return res.send('Invalid CPR ID.')

    const existingUser = await User.findOne({ username })
    if (existingUser) return res.send('Username exists.')

    const hashedPassword = await bcrypt.hash(password, 10)
    await User.create({ username, password: hashedPassword, role: 'Patient' })
    res.redirect('/auth/sign-in')
  } catch (err) {
    console.error(err)
    res.send('Error signing up.')
  }
})

// GET: sign-in form
router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in.ejs')
})

// POST: sign-in submission
router.post('/sign-in', async (req, res) => {
  const { username, password } = req.body
  try {
    const admin = await User.findOne({ username, role: 'Admin' })
    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password)
      if (isMatch) {
        req.session.user = admin
        return res.redirect('/')
      }
      return res.send('Invalid password.')
    }

    const patient = await Patient.findOne({ cprId: username })
    if (patient) {
      req.session.user = {
        username,
        role: 'Patient',
        _id: patient._id,
        profilePicture: patient.profilePicture
      }
      return res.redirect('/patients/me')
    }

    res.send('Invalid username or CPR ID.')
  } catch (err) {
    console.error(err)
    res.send('Error signing in.')
  }
})

// GET: sign-out
router.get('/sign-out', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/')
  })
})

// Profile route
router.get('/profile', isSignedIn, async (req, res) => {
  try {
    let userOrPatient;
    if (req.session.user.role === 'Admin') {
      userOrPatient = await User.findById(req.session.user._id);
    } else if (req.session.user.role === 'Patient') {
      userOrPatient = await Patient.findOne({
        cprId: req.session.user.username
      });
    }
    if (!userOrPatient) {
      return res.send('User not found.');
    }
    req.session.user.profilePicture = userOrPatient.profilePicture?.data
      ? `/profile-picture/${userOrPatient._id}`
      : '/uploads/default-profile.png'

    res.render('profile.ejs', {
      user: {
        ...userOrPatient.toObject(),
        profilePicture: req.session.user.profilePicture
      }
    })
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
