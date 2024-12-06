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
    res.render('patients/index.ejs', { patients, user: req.session.user })
  } catch (err) {
    res.status(500).send('Error fetching patients')
  }
})

// GET form to create a new patient (Admin only)
router.get('/new', isSignedIn, requireAdmin, async (req, res) => {
  try {
    const departments = await Department.find()
    const urgencies = await Urgency.find()
    const currentDate = new Date().toISOString().split('T')[0]
    res.render('patients/new.ejs', { departments, urgencies, currentDate })
  } catch (err) {
    console.error('Error rendering new patient form:', err)
    res.status(500).send('Error loading form')
  }
})

// POST create a new patient (Admins only)
router.post('/', isSignedIn, requireAdmin, async (req, res) => {
  try {
    const { name, age, gender, cprId, department, urgencyLevel } = req.body

    if (!name || !age || !gender || !cprId || !department || !urgencyLevel) {
      return res.status(400).send('All fields are required.')
    }

    const [departmentExists, urgencyExists] = await Promise.all([
      Department.findById(department),
      Urgency.findById(urgencyLevel)
    ])

    if (!departmentExists) return res.status(400).send('Invalid department ID.')
    if (!urgencyExists) return res.status(400).send('Invalid urgency level ID.')

    const patientData = { ...req.body, userId: req.session.user._id }
    await Patient.create(patientData)

    res.redirect('/patients')
  } catch (err) {
    console.error('Error creating patient:', err)
    res.status(500).send('Error creating patient. Please try again.')
  }
})

// GET single patient details (Admin and patient can view their own)
router.get('/:patientId', isSignedIn, async (req, res) => {
  try {
    console.log('Session user:', req.session.user);

    const patient = await Patient.findById(req.params.patientId)
      .populate('department')
      .populate('urgencyLevel')
      .populate('userId');

    if (!patient) {
      return res.status(404).send('Patient not found');
    }

    // Access control: Admin or the patient themselves
    if (
      req.session.user.role.toLowerCase() === 'admin' ||
      patient.userId.equals(req.session.user._id)
    ) {
      res.render('patients/show.ejs', { patient, user: req.session.user });
    } else {
      res.status(403).send('Access denied.');
    }
  } catch (err) {
    console.error('Error fetching patient details:', err);
    res.status(500).send('Error fetching patient details');
  }
});

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
router.get('/:id/edit', isSignedIn, requireAdmin, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('department')
      .populate('urgencyLevel');
      
    if (!patient) {
      return res.status(404).send('Patient not found.');
    }

    const departments = await Department.find();
    const urgencies = await Urgency.find();

    res.render('patients/edit.ejs', { patient, departments, urgencies });
  } catch (err) {
    console.error('Error rendering edit form:', err);
    res.status(500).send('Error rendering edit form.');
  }
});


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
