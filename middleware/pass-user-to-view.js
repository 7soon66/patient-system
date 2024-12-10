const User = require('../models/user')
const Patient = require('../models/patient')

const passUsertoView = async (req, res, next) => {
  if (req.session.user) {
    try {
      let userOrPatient
      if (req.session.user.role === 'Admin') {
        userOrPatient = await User.findById(req.session.user._id)
      } else if (req.session.user.role === 'Patient') {
        userOrPatient = await Patient.findOne({
          cprId: req.session.user.username
        })
      }

      if (userOrPatient) {
        req.session.user.profilePicture = `/profile-picture/${userOrPatient._id}`
        res.locals.user = req.session.user
      } else {
        res.locals.user = null
      }
    } catch (err) {
      console.error('Error in passUsertoView middleware:', err)
      res.locals.user = null
    }
  } else {
    res.locals.user = null
  }

  next()
}

module.exports = passUsertoView
