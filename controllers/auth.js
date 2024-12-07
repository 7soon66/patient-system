const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const Patient = require('../models/patient')
const router = express.Router()

// GET sign-up form
router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up.ejs')
})

// POST sign-up form submission
router.post('/sign-up', async (req, res) => {
  const { username, password } = req.body

  try {
    // Check for empty fields
    if (!username || !password) {
      return res.status(400).send('Username and password are required.')
    }

    // Validate CPR ID by checking the Patient schema
    const patient = await Patient.findOne({ cprId: username })
    if (!patient) {
      return res.status(400).send('Invalid CPR ID. No matching patient found.')
    }

    // Check if the username already exists
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(400).send('Username already exists.')
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user with default role ('Patient')
    await User.create({ username, password: hashedPassword, role: 'Patient' })

    res.redirect('/auth/sign-in')
  } catch (err) {
    console.error('Error signing up:', err)
    res.status(500).send('Error signing up. Please try again.')
  }
})

// GET sign-in form
router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in.ejs')
})

// POST sign-in form submission
router.post('/sign-in', async (req, res) => {
  const { username, password } = req.body

  try {
    console.log('Login attempt with:', username)

    const admin = await User.findOne({ username, role: 'Admin' })
    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password)
      if (isMatch) {
        req.session.user = admin
        return res.redirect('/admin-dashboard')
      }
      return res.status(400).send('Invalid password.')
    }

    const patient = await Patient.findOne({ cprId: username })
    if (patient) {
      req.session.user = { username, role: 'Patient' }
      return res.redirect('/patients/me')
    }

    return res.status(400).send('Invalid username or CPR ID')
  } catch (err) {
    console.error('Error logging in:', err)
    res.status(500).send('Error logging in.')
  }
})

// GET sign-out
router.get('/sign-out', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/')
  })
})

module.exports = router
