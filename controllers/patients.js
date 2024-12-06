const express = require('express')
const router = express.Router()
const Patient = require('../models/patient')
const Department = require('../models/department')
const Urgency = require('../models/urgency')
const isSignedIn = require('../middleware/is-signed-in')

// Middleware for admin-only access
const requireAdmin = (req, res, next) => {
  if (req.session.user.role === 'Admin') {
    return next()
  }
  res.status(403).send('Access denied. Admins only.')
}

// GET all patients (Admins only)
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
    const departments = await Department.find()
    const urgencys = await Urgency.find()
    const currentDate = new Date().toISOString().split('T')[0]
    res.render('patients/new.ejs', { departments, urgencys, currentDate })
  } catch (err) {
    console.error('Error rendering new patient form:', err)
    res.status(500).send('Error loading form')
  }
})

// POST create a new patient (Admins only)
router.post('/', isSignedIn, requireAdmin, async (req, res) => {
  try {
    req.body.userId = req.session.user._id // Assign admin as the creator
    await Patient.create(req.body)
    res.redirect('/patients')
  } catch (err) {
    res.status(500).send('Error creating patient')
  }
})

// GET single patient details (Admin and patient can view their own)
router.get('/:patientId', isSignedIn, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId).populate(
      'department urgencyLevel userId'
    )

    if (!patient) {
      return res.status(404).send('Patient not found')
    }

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
