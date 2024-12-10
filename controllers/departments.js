const express = require('express')
const router = express.Router()
const Department = require('../models/department')

// GET: all departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find({})
    res.json(departments)
  } catch (err) {
    res.send('Error fetching departments.')
  }
})

module.exports = router
