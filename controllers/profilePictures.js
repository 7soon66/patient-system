const express = require('express')
const multer = require('multer')
const User = require('../models/user')
const Patient = require('../models/patient')

const router = express.Router()

// Configure Multer storage to store file in memory
const storage = multer.memoryStorage()
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
        return res.send('User not found.')
      }

      userOrPatient.profilePicture = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }

      await userOrPatient.save()
      res.redirect('/auth/profile')
    } catch (err) {
      console.error('Error uploading profile picture:', err)
      res.send('Error uploading profile picture.')
    }
  }
)

// GET route to serve profile picture
router.get('/profile-picture/:id', async (req, res) => {
  try {
    let userOrPatient =
      (await User.findById(req.params.id)) ||
      (await Patient.findById(req.params.id))

    if (!userOrPatient || !userOrPatient.profilePicture) {
      return res.send('No image found.')
    }
    res.contentType(userOrPatient.profilePicture.contentType)
    res.send(userOrPatient.profilePicture.data)
  } catch (err) {
    console.error('Error fetching profile picture:', err)
    res.send('Error fetching profile picture.')
  }
})

module.exports = router
