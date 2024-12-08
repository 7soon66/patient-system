const mongoose = require('mongoose')

const visitationLogSchema = new mongoose.Schema({
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  urgencyLevel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Urgency',
    required: true
  },
  notes: { type: String },
  date: { type: Date, required: true }
})

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
      enum: ['Male', 'Female', 'Other'," "],
      required: true,
      default:" "
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    cprId: {
      type: Number,
      unique: true,
      required: true
    },
    urgencyLevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Urgency'
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
    visitationLogs: [visitationLogSchema]
  },
  { timestamps: true }
)

const Patient = mongoose.model('Patient', patientSchema)

module.exports = Patient
