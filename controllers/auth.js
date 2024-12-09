const express = require('express')
const bcrypt = require('bcryptjs')
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
      return res.status(400).send('Username and password required.')

    const patient = await Patient.findOne({ cprId: username })
    if (!patient) return res.status(400).send('Invalid CPR ID.')

    const existingUser = await User.findOne({ username })
    if (existingUser) return res.status(400).send('Username exists.')

    const hashedPassword = await bcrypt.hash(password, 10)
    await User.create({ username, password: hashedPassword, role: 'Patient' })
    res.redirect('/auth/sign-in')
  } catch (err) {
    console.error(err)
    res.status(500).send('Error signing up.')
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
      return res.status(400).send('Invalid password.')
    }

    const patient = await Patient.findOne({ cprId: username })
    if (patient) {
      req.session.user = { username, role: 'Patient' }
      return res.redirect('/patients/me')
    }

    res.status(400).send('Invalid username or CPR ID.')
  } catch (err) {
    console.error(err)
    res.status(500).send('Error signing in.')
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
    // Fetch user or patient depending on role
    let userOrPatient
    if (req.session.user.role === 'Admin') {
      userOrPatient = await User.findById(req.session.user._id)
    } else if (req.session.user.role === 'Patient') {
      userOrPatient = await Patient.findOne({
        cprId: req.session.user.username
      })
    }

    if (!userOrPatient) {
      return res.status(404).send('User not found.')
    }

    // Render the profile with the user or patient data
    res.render('profile.ejs', {
      user: userOrPatient,
      isPatient: req.session.user.role === 'Patient'
    })
  } catch (err) {
    console.error('Error loading profile page:', err)
    res.status(500).send('Internal Server Error.')
  }
})

module.exports = router
