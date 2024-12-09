const express = require('express')
const router = express.Router()
const Patient = require('../models/patient')
const Department = require('../models/department')
const Urgency = require('../models/urgency')
const isSignedIn = require('../middleware/is-signed-in')

// Only admins allowed
const requireAdmin = (req, res, next) => {
  if (req.session.user.role === 'Admin') return next()
  res.status(403).send('Admins only.')
}

// GET all patients (Admin)
router.get('/', isSignedIn, requireAdmin, async (req, res) => {
  try {
    const patients = await Patient.find().populate('department urgencyLevel')
    res.render('patients/index.ejs', { patients, user: req.session.user })
  } catch (err) {
    res.status(500).send('Error fetching patients.')
  }
})

// GET new patient form (Admin)
router.get('/new', isSignedIn, requireAdmin, async (req, res) => {
  try {
    const departments = await Department.find()
    const urgencies = await Urgency.find()
    const currentDate = new Date().toISOString().split('T')[0]
    res.render('patients/new.ejs', { departments, urgencies, currentDate })
  } catch (err) {
    console.error(err)
    res.status(500).send('Error loading form.')
  }
})

// POST create patient (Admin)
router.post('/', isSignedIn, requireAdmin, async (req, res) => {
  try {
    const { name, age, gender, cprId, department, urgencyLevel } = req.body
    if (!name || !age || !gender || !cprId || !department || !urgencyLevel) {
      return res.status(400).send('All fields required.')
    }

    const [dept, urgency] = await Promise.all([
      Department.findById(department),
      Urgency.findById(urgencyLevel)
    ])

    if (!dept) return res.status(400).send('Invalid department.')
    if (!urgency) return res.status(400).send('Invalid urgency level.')

    const patientData = { ...req.body, userId: req.session.user._id }
    await Patient.create(patientData)
    res.redirect('/patients')
  } catch (err) {
    console.error(err)
    res.status(500).send('Error creating patient.')
  }
})

// GET logged-in patient details (Patient only)
router.get('/me', isSignedIn, async (req, res) => {
  try {
    if (req.session.user.role !== 'Patient') {
      return res.status(403).send('Patients only.')
    }
    const patient = await Patient.findOne({
      cprId: req.session.user.username
    }).populate('department urgencyLevel userId')

    if (!patient) return res.status(404).send('Patient not found.')
    res.render('patients/show.ejs', { patient, user: req.session.user })
  } catch (err) {
    console.error(err)
    res.status(500).send('Error fetching patient.')
  }
})

// GET patient details (Admin or the patient)
router.get('/:patientId', isSignedIn, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId).populate(
      'department urgencyLevel userId'
    )

    if (!patient) return res.status(404).send('Patient not found.')

    if (
      req.session.user.role.toLowerCase() === 'admin' ||
      patient.userId.equals(req.session.user._id)
    ) {
      res.render('patients/show.ejs', { patient, user: req.session.user })
    } else {
      res.status(403).send('Access denied.')
    }
  } catch (err) {
    console.error(err)
    res.status(500).send('Error fetching patient.')
  }
})

// DELETE patient (Admin)
router.delete('/:patientId', isSignedIn, requireAdmin, async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.patientId)
    res.redirect('/patients')
  } catch (err) {
    res.status(404).send('Patient not found.')
  }
})

// GET edit form (Admin)
router.get('/:id/edit', isSignedIn, requireAdmin, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate(
      'department urgencyLevel'
    )
    if (!patient) return res.status(404).send('Patient not found.')

    const departments = await Department.find()
    const urgencies = await Urgency.find()
    res.render('patients/edit.ejs', { patient, departments, urgencies })
  } catch (err) {
    console.error(err)
    res.status(500).send('Error loading edit form.')
  }
})

// PUT update patient (Admin)
router.put('/:patientId', isSignedIn, requireAdmin, async (req, res) => {
  try {
    await Patient.findByIdAndUpdate(req.params.patientId, req.body, {
      new: true
    })
    res.redirect('/patients')
  } catch (err) {
    res.status(404).send('Patient not found.')
  }
})

module.exports = router
