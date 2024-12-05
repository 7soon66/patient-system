const express = require('express')
const router = express.Router()
const Department = require('../models/departments')

// Middleware (admin access)
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).send('Access denied.')
  }
  next()
}

// Routes/ API's/ Core Fuctionality

// test
      
      router.get('/', async (req, res) => {
        const patient = await Patient.find()
        res.render('patients/index.ejs', {patient});
      })

      router.get('/new', async (req, res) => {
        res.render('patients/new.ejs');
      })

      router.post('/', async (req, res) => {
        req.body.owner = req.session.user._id;
        await Patient.create(req.body);
        res.redirect('/patients');
      })

      router.get('/:patientId', async(req, res) => {
        const patient = await Patient.findById(req.params.patientId);
        res.render('patients/show.ejs', { patient })
      })

      router.delete('/:patientId', async (req, res) => {
        const patient = await Patient.findById(req.params.patientId);
        if (patient.owner.equals(req.session.user._id)) {
        await patient.deleteOne();
        res.redirect('/patients');
        } else {
        res.send("You don't have permission to do that.");
        }
      })

      router.get('/:patientId/edit', async (req, res) => {
        const currentPatient = await Patient.findById(req.params.patientId);
        res.render('patients/edit.ejs', {patient: currentPatient,});
      })

      router.put('/:patientId', async (req, res) => {
        const currentPatient = await Patient.findById(req.params.patientId);
        if (currentPatient.equals(req.session.user._id)) {
        await currentPatient.updateOne(req.body);
        res.redirect('/patients');
        } else {
        res.send("You don't have permission to do that.");
        }
      })





// GET all departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find({})
    res.json(departments)
  } catch (err) {
    res.status(500).send('Error fetching departments')
  }
})

// POST create a new department (Admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const newDepartment = new Department({
      name: req.body.name
    })
    await newDepartment.save()
    res.status(201).send(newDepartment)
  } catch (err) {
    res.status(400).send('Error creating department')
  }
})

module.exports = router
