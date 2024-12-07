const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const router = express.Router()

// GET sign-up form
router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up.ejs')
})

// POST sign-up form submission
router.post('/sign-up', async (req, res) => {
  try {
    const hashedPassword = bcrypt.hashSync(
      req.body.password,
      bcrypt.genSaltSync(10)
    )
    await User.create({
      username: req.body.username,
      password: hashedPassword,
      role: 'Patient'
    })
    res.redirect('/auth/sign-in')
  } catch (err) {
    res.status(500).send('Error signing up. Please try again.')
  }
})

// GET sign-in form
router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in.ejs')
})

// POST sign-in form submission
router.post('/sign-in', async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username })
    if (!userInDatabase) {
      return res.send('Login failed. Please try again.')
    }

    const validPassword = bcrypt.compareSync(
      req.body.password,
      userInDatabase.password
    )
    if (!validPassword) {
      return res.send('Login failed. Please try again.')
    }

    // Store user details in session
    req.session.user = {
      username: userInDatabase.username,
      _id: userInDatabase._id,
      role: userInDatabase.role
    }

    res.redirect('/')
  } catch (err) {
    res.status(500).send('Error signing in. Please try again.')
  }
})

// GET sign-out
router.get('/sign-out', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/sign-in')
  })
})

module.exports = router
