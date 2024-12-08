const mongoose = require('mongoose');

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
    required: true,
  },
});

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
  ];

  const existingUrgencies = await this.find();
  if (existingUrgencies.length === 0) {
    const urgencies = predefinedUrgencies.map((level) => ({ level }));
    await this.insertMany(urgencies);
    console.log('Urgency levels initialized.');
  }
};

const Urgency = mongoose.model('Urgency', urgencySchema);

module.exports = Urgency;
