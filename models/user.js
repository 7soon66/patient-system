const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Admin', 'Patient'],
    default: 'Patient'
  },
  profilePicture: {
    type: String,
    default: '/uploads/default-profile.jpg' 
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User
