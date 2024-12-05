const router=require("express").Router()


const Patient = require("../models/patients")
//Import model
const Listing=require("../models/patients")
const { route } = require("./auth")

router.get("/",async (req,res)=>{
  const patients= await Patient.find()
  res.render("patients/index.ejs",{patients})
})


router.get("/new",async(req,res)=>{
  res.render("patients/new.ejs")
})

router.post("/", async(req,res)=>{
  //it will be that our user is the owner so we asign the info that will be entered to that userid
  req.body.owner=req.session.user._id
  await Listing.create(req.body)
  res.redirect("/patients")
})