const express = require('express')
const multer = require('multer')
const path = require('path')
const User = require('../models/user')
const router = express.Router()

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/
    const isValid =
      allowedTypes.test(path.extname(file.originalname).toLowerCase()) &&
      allowedTypes.test(file.mimetype)
    if (isValid) cb(null, true)
    else cb(new Error('Only JPEG, JPG, or PNG files are allowed.'))
  }
})

// Route to upload profile picture
router.post('/upload', upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send('No file uploaded.')

    const user = await User.findById(req.session.user._id)
    if (!user) return res.status(404).send('User not found.')

    user.profilePicture = `/uploads/${req.file.filename}`
    await user.save()

    res.redirect('/profile')
  } catch (err) {
    console.error(err)
    res.status(500).send('Error uploading profile picture.')
  }
})

module.exports = router
