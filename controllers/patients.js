const router = require("express").Router();

const Patient = require("../models/patient");

// ... other routes ...

// Get all patients
router.get("/", async (req, res) => {
  const patients = await Patient.find();
  res.render("patients/index.ejs", { patients });
});

// New patient form
router.get("/new", async (req, res) => {
  res.render("patients/new.ejs");
});

// ... other routes ...

module.exports = router;