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
