const mongoose = require('mongoose')

const urgencySchema = new mongoose.Schema({
  level: {
    type: String,
    enum: [
      'Basic',
      'Intermediate',
      'Intensive',
      'Emergency',
      'Critical',
      'Observation',
      'Step-Down',
      'Urgent Surgery',
      'End-of-Life Care'
    ],
    required: true
  }
})

// Static method to initialize urgencies
urgencySchema.statics.initialize = async function () {
  const predefinedUrgencies = [
    'Basic',
    'Intermediate',
    'Intensive',
    'Emergency',
    'Critical',
    'Observation',
    'Step-Down',
    'Urgent Surgery',
    'End-of-Life Care'
  ]

  try {
    for (const level of predefinedUrgencies) {
      const exists = await this.findOne({ level })
      if (!exists) {
        await this.create({ level })
        console.log(`Urgency level '${level}' added.`)
      }
    }
  } catch (err) {
    console.error('Error initializing urgency levels:', err)
  }
}

const Urgency = mongoose.model('Urgency', urgencySchema)

module.exports = Urgency
