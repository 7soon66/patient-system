const mongoose = require('mongoose')

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: [
      'Cardiology',
      'Neurology',
      'Orthopedics',
      'Gastroenterology',
      'Dermatology',
      'Pediatrics',
      'Oncology',
      'Radiology',
      'Emergency',
      'Psychiatry',
      'Urology',
      'Nephrology',
      'Endocrinology',
      'Ophthalmology',
      'ENT',
      'Pulmonology',
      'Rheumatology'
    ]
  },
  description: {
    type: String,
    required: true
  }
})

// Predefine department descriptions
const departmentDescriptions = {
  Cardiology: 'Handles conditions related to the heart and blood vessels.',
  Neurology: 'Cares for disorders of the brain and nervous system.',
  Orthopedics: 'Deals with bones, joints, and the musculoskeletal system.',
  Gastroenterology: 'Focuses on the digestive system and its disorders.',
  Dermatology: 'Cares for skin, hair, and nail conditions.',
  Pediatrics: 'Provides medical care for infants, children, and adolescents.',
  Oncology: 'Specializes in the diagnosis and treatment of cancer.',
  Radiology: 'Uses imaging technologies to diagnose and treat conditions.',
  Emergency: 'Provides urgent care for acute illnesses and injuries.',
  Psychiatry: 'Focuses on mental health and emotional well-being.',
  Urology: 'Cares for the urinary system and male reproductive organs.',
  Nephrology: 'Focuses on kidney health and related disorders.',
  Endocrinology: 'Treats hormonal imbalances and endocrine disorders.',
  Ophthalmology: 'Deals with the eyes and vision care.',
  ENT: 'Cares for ear, nose, and throat conditions.',
  Pulmonology: 'Treats respiratory system diseases and disorders.',
  Rheumatology: 'Focuses on joint, muscle, and autoimmune diseases.'
}

// Middleware to auto-assign description
departmentSchema.pre('save', function (next) {
  if (departmentDescriptions[this.name]) {
    this.description = departmentDescriptions[this.name]
  }
  next()
})

const Department = mongoose.model('Department', departmentSchema)

module.exports = Department
