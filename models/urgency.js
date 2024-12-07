const mongoose = require('mongoose')

const urgencySchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['Basic', 'Intermediate', 'Intensive'], // Levels of urgency
    required: true
  }
})

const Urgency = mongoose.model('Urgency', urgencySchema)

module.exports = Urgency
