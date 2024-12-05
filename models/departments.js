const mongoose = require('mongoose')

// Predefined descriptions for each department
const departmentDescriptions = {
  Cardiology: 'Handles conditions related to the heart and blood vessels.',
  Gastroenterology: 'Focuses on the digestive system and its disorders.',
  Neurology: 'Cares for disorders of the brain and nervous system.',
  Orthopedics: 'Treats issues related to bones, muscles, and joints.',
  Pediatrics: 'Provides healthcare for children and adolescents.',
  Oncology: 'Specializes in cancer diagnosis and treatment.',
  Emergency: 'Acute care for emergencies and critical conditions.',
  Dermatology: 'Manages skin-related diseases and conditions.',
  Endocrinology: 'Treats disorders related to hormones and glands.',
  Ophthalmology: 'Focuses on eye and vision care.',
  Radiology: 'Provides imaging diagnostics for medical conditions.',
  Psychiatry: 'Treats mental health and psychological disorders.',
  Urology: 'Focuses on the urinary tract and male reproductive system.',
  Surgery: 'Performs general and specialized surgical procedures.',
  'Obstetrics and Gynecology':
    'Cares for women’s reproductive health and childbirth.',
  Anesthesiology: 'Manages pain and provides anesthesia during surgery.',
  Rheumatology: 'Deals with autoimmune and joint-related conditions.',
  Nephrology: 'Treats disorders related to the kidneys.',
  Pulmonology: 'Cares for the lungs and respiratory system.',
  Hematology: 'Manages blood-related disorders and diseases.'
}

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: Object.keys(departmentDescriptions)
  },
  description: {
    type: String,
    default: ''
  }
})

// Middleware to set description based on name
departmentSchema.pre('save', function (next) {
  this.description = departmentDescriptions[this.name]
  next()
})

const Department = mongoose.model('Department', departmentSchema)

module.exports = Department
