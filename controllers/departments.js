const express = require('express')
const router = express.Router()
const Department = require('../models/department')

// GET all predefined departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find({})
    res.json(departments)
  } catch (err) {
    res.status(500).send('Error fetching departments')
  }
})

module.exports = router
