const mongoose = require('mongoose')

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    age: {
      type: Number,
      required: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      require: true
      // errorMessage:"choose a gender"
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    cprId: {
      type: Number,
      unique: true,
      required: true,
      
    },
    urgencyLevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Urgency',
      require: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    profilePicture: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
)

const Patient = mongoose.model('Patient', patientSchema)

module.exports = Patient
