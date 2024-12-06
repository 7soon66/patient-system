// seedData.js
const Department = require('./models/department')
const Urgency = require('./models/urgency')

const seedData = async () => {
  // Optional: Clear existing data (use caution in production)
  await Department.deleteMany({})
  await Urgency.deleteMany({})

  const departments = [
    {
      name: 'Cardiology',
      description: 'Handles conditions related to the heart and blood vessels.'
    },
    {
      name: 'Neurology',
      description: 'Cares for disorders of the brain and nervous system.'
    },
    {
      name: 'Orthopedics',
      description: 'Deals with bones, joints, and the musculoskeletal system.'
    },
    {
      name: 'Gastroenterology',
      description: 'Focuses on the digestive system and its disorders.'
    },
    {
      name: 'Dermatology',
      description: 'Cares for skin, hair, and nail conditions.'
    },
    {
      name: 'Pediatrics',
      description:
        'Provides medical care for infants, children, and adolescents.'
    },
    {
      name: 'Oncology',
      description: 'Specializes in the diagnosis and treatment of cancer.'
    },
    {
      name: 'Radiology',
      description: 'Uses imaging technologies to diagnose and treat conditions.'
    },
    {
      name: 'Emergency',
      description: 'Provides urgent care for acute illnesses and injuries.'
    },
    {
      name: 'Psychiatry',
      description: 'Focuses on mental health and emotional well-being.'
    },
    {
      name: 'Urology',
      description: 'Cares for the urinary system and male reproductive organs.'
    },
    {
      name: 'Nephrology',
      description: 'Focuses on kidney health and related disorders.'
    },
    {
      name: 'Endocrinology',
      description: 'Treats hormonal imbalances and endocrine disorders.'
    },
    {
      name: 'Ophthalmology',
      description: 'Deals with the eyes and vision care.'
    },
    { name: 'ENT', description: 'Cares for ear, nose, and throat conditions.' },
    {
      name: 'Pulmonology',
      description: 'Treats respiratory system diseases and disorders.'
    },
    {
      name: 'Rheumatology',
      description: 'Focuses on joint, muscle, and autoimmune diseases.'
    }
  ]

  // Seed Departments
  for (const department of departments) {
    await Department.create(department)
  }

  // Seed Urgency Levels
  const urgencys = [
    { level: 'Basic' },
    { level: 'Intermediate' },
    { level: 'Intensive' }
  ]

  for (const urgency of urgencys) {
    await Urgency.create(urgency)
  }

  console.log('Seeding done!')
}

module.exports = seedData
