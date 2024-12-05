const express = require('express')
const router = express.Router()
const Patient = require('../models/patients.js')
const isSignedIn = require('../middleware/is-signed-in')

// Middleware for admin-only access
const requireAdmin = (req, res, next) => {
  if (req.session.user.role === 'Admin') {
    return next()
  }
  res.status(403).send('Access denied. Admins only.')
}

// GET all patients (Admin only)
router.get('/', isSignedIn, requireAdmin, async (req, res) => {
  try {
    const patients = await Patient.find().populate('department urgencyLevel')
    res.render('patients/index.ejs', { patients })
  } catch (err) {
    res.status(500).send('Error fetching patients')
  }
})

// GET form to create a new patient (Admin only)
router.get('/new', isSignedIn, requireAdmin, async (req, res) => {
  try {
    res.render('patients/new.ejs')
  } catch (err) {
    res.status(500).send('Error loading form')
  }
})

// POST create a new patient (Admin only)
router.post('/', isSignedIn, requireAdmin, async (req, res) => {
  try {
    req.body.userId = req.session.user._id // Assign admin as the creator
    await Patient.create(req.body)
    res.redirect('/patients')
  } catch (err) {
    res.status(500).send('Error creating patient')
  }
})

// GET single patient details (Patients and Admins)
router.get('/:patientId', isSignedIn, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId).populate(
      'department urgencyLevel userId'
    )

    if (!patient) {
      return res.status(404).send('Patient not found')
    }

    // Check if user is admin or owner (patient can only view their own record)
    if (
      req.session.user.role === 'Admin' ||
      patient.userId.equals(req.session.user._id)
    ) {
      res.render('patients/show.ejs', { patient })
    } else {
      res.status(403).send('Access denied.')
    }
  } catch (err) {
    res.status(500).send('Error fetching patient details')
  }
})

// DELETE a patient (Admin only)
router.delete('/:patientId', isSignedIn, requireAdmin, async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.patientId)
    res.redirect('/patients')
  } catch (err) {
    res.status(404).send('Patient not found')
  }
})

// GET form to edit a patient (Admin only)
router.get('/:patientId/edit', isSignedIn, requireAdmin, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId)
    if (!patient) {
      return res.status(404).send('Patient not found')
    }
    res.render('patients/edit.ejs', { patient })
  } catch (err) {
    res.status(500).send('Error loading edit form')
  }
})

// PUT update a patient (Admin only)
router.put('/:patientId', isSignedIn, requireAdmin, async (req, res) => {
  try {
    await Patient.findByIdAndUpdate(req.params.patientId, req.body, {
      new: true
    })
    res.redirect('/patients')
  } catch (err) {
    res.status(404).send('Patient not found')
  }
})

module.exports = router
