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
    data: Buffer,
    contentType: String
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User
