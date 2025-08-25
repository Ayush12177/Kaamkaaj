var express = require('express');
const session = require('express-session');
var cookieParser = require("cookie-parser");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var app = express.Router();
var { IsLoggedIn } = require("../middleware/isloggedin.js");
const { isUser } = require("../middleware/isUser.js");
const seekerModel = require("../models/seeker.js");
const userModel = require("../models/user.js");
const seeker = require('../models/seeker.js');
const user = require('../models/user.js');
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
  })
  
const upload = multer({ storage: storage })


app.use(cookieParser());

/* GET home page. */
app.get('/', function (req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.render('kamkaj', { userType: null });
  }
// google Oauth authentication

  // Try to decode as seeker
  jwt.verify(token, "ayush", (err, seekerDecoded) => {
    if (!err && seekerDecoded && seekerDecoded.seekerid) {
      return res.render('kamkaj', { userType: 'seeker' });
    }

    // If not a valid seeker token, try as user
    jwt.verify(token, "bhumii", (err2, userDecoded) => {
      if (!err2 && userDecoded && userDecoded.userid) {
        return res.render('kamkaj', { userType: 'user' });
      }

      // If token is invalid for both, render as logged out
      return res.render('kamkaj', { userType: null });
    });
  });
});

app.get('/register/jobseeker', (req, res) => {
  res.render('register')
});

app.post('/register/jobseeker',upload.single("image"), async (req, res) => {
  const { name, email, phone, role , job, city, password } = req.body;
  let seeker = await seekerModel.findOne({ email: email });
  if (seeker) return res.status(500).send("Jobseeker already exist")
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let seeker = await seekerModel.create({
        name: name,
        email: email,
        image: req.file.filename,
        phone: phone,
        jobs: job,
        city: city,
        password: hash,
      })
      let token = jwt.sign({ email }, "ayush");
      res.cookie("token", token);
      res.redirect('/login/jobseeker')
    })
  })
});

app.get('/register/user', (req, res) => {
  res.render('userreg')
});

app.post('/register/user',upload.single("image"), async (req, res) => {
  const { name, email, role, phone, password } = req.body;
  let user = await userModel.findOne({ email: email });
  if (user) return res.status(500).send("User already exist")

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModel.create({
        name: name,
        email: email,
        image: req.file.filename,
        phone: phone,
        password: hash,
      })
      res.redirect('/login/user')
    })
  })
});



app.get("/workers", isUser, async function (req, res) {
  const role = req.query.role;
  const searchQuery = req.query.search;
  let seekers;

  if (role) {
    // If a role is provided, filter seekers by that role
    seekers = await seekerModel.find({ jobs: role });
  } else if (searchQuery) {
    // If a search query is provided, filter seekers by that query
    seekers = await seekerModel.find({ jobs: { $regex: searchQuery, $options: 'i' } });
  } else {
    // If no role or search query is provided, fetch all seekers
    seekers = await seekerModel.find();
  }
  return res.render("seeker", { seekers });
});

app.get("/login/jobseeker", (req, res) => {
  res.render('login')
});

app.post("/login/jobseeker", async (req, res) => {
  const email = req.body.email;
  console.log(email);

  let seeker = await seekerModel.findOne({ email });
  console.log(seeker);

  if (!seeker) res.status(500).send("Something Went wrong..");

  bcrypt.compare(req.body.password, seeker.password, function (err, result) {
    if (result) {
      let token = jwt.sign({ email: email, seekerid: seeker._id }, "ayush");
      res.cookie("token", token);
      res.status(200).redirect('/seekerdash');
    } else {
      res.redirect("/login/jobseeker");
    }
  })
});

app.get("/login/user", (req, res) => {
  res.render('userlogin')
});

app.post("/login/user", async (req, res) => {
  const email = req.body.email;
  console.log(email);

  let user = await userModel.findOne({ email });
  console.log(user);

  if (!user) res.status(500).send("Something Went wrong..");

  bcrypt.compare(req.body.password, user.password, function (err, result) {
    if (result) {
      let token = jwt.sign({ email: email, userid: user._id }, "bhumii");
      res.cookie("token", token);
      res.status(200).redirect('/userdash');
    } else {
      res.redirect("/login/user");
    }
  })
});

app.get("/dashboard", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.render("login");
  }

  // First try to verify with seeker secret
  jwt.verify(token, "ayush", (err, decoded) => {
    if (!err && decoded && decoded.seekerid) {
      req.seeker = decoded;
      return res.redirect("/seekerdash");
    }

    // If failed or not seeker, try verifying with user secret
    jwt.verify(token, "bhumii", (err2, decoded2) => {
      if (!err2 && decoded2 && decoded2.userid) {
        req.user = decoded2;
        return res.redirect("/userdash");
      }

      // If both fail, send back to login
      return res.render("login");
    });
  });
});

app.get("/seekerdash", IsLoggedIn, async (req, res) => {
  try {
    if (!req.seeker || !req.seeker.email) {
      return res.status(500).send("user not found");
    }
    const seeker = await seekerModel.findOne({ email: req.seeker.email });
    if (!seeker) return res.send("invalid request");
    else {
      return res.render("seekerdash", { seeker });
    }
  } catch (err) {
    res.send("error");
  }
});

app.get("/userdash", isUser, async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(500).send("user not found");
    }
    const user = await userModel.findOne({ email: req.user.email });
    if (!user) return res.send("invalid request");
    else {
      return res.render("userdash", { user });
    }
  } catch (err) {
    res.send("error");
  }
});

app.get("/edit/:userid", async (req, res) => {
  let user = await seekerModel.findOne({ _id: req.params.userid });
  res.render("edit", { user });
});

app.post("/update/:userid",upload.single('image'), async (req, res) => {
  let { name, email, phone } = req.body;
  let user = await seekerModel.findOneAndUpdate({ _id: req.params.userid }, { image:req.file.filename, name, email, phone }, { new: true });
  res.redirect("/seekerdash");
});

app.get("/delete/:id", async (req, res) => {
  let user = await seekerModel.findOneAndDelete({ _id: req.params.id });
  res.redirect("/")
});

app.get("/logout", (req, res) => {
    res.cookie("token", "", { expires: new Date(0) });
    return res.render('kamkaj', { userType: null });
});

module.exports = app;