const express = require('express')
const multer = require('multer')
const path = require('path')
const User = require('../models/user')
const Patient = require('../models/patient')

const router = express.Router()

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/')
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${
        req.session.user._id || req.session.user.username
      }-${Date.now()}${path.extname(file.originalname)}`
    )
  }
})

const upload = multer({ storage })

// POST route to upload profile picture
router.post(
  '/profile-picture/upload',
  upload.single('profilePicture'),
  async (req, res) => {
    try {
      let userOrPatient

      if (req.session.user.role === 'Admin') {
        userOrPatient = await User.findById(req.session.user._id)
      } else if (req.session.user.role === 'Patient') {
        userOrPatient = await Patient.findOne({
          cprId: req.session.user.username
        })
      }

      if (!userOrPatient) {
        return res.status(404).send('User not found.')
      }

      // Update the profilePicture field
      userOrPatient.profilePicture = `/uploads/${req.file.filename}`
      await userOrPatient.save()

      res.redirect('/auth/profile')
    } catch (err) {
      console.error('Error uploading profile picture:', err)
      res.status(500).send('Error uploading profile picture.')
    }
  }
)

module.exports = router
