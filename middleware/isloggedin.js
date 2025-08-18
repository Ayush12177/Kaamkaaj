const jwt = require("jsonwebtoken")
function IsLoggedIn(req, res, next) {
  try {
    if (req.cookies.token === ""){
      res.redirect("/login")
    }
    else {
      const data = jwt.verify(req.cookies.token, "ayush");
      req.seeker = data;
      next();
    }
  }
  catch (err) {

    return res.redirect("/login/jobseeker"); // or return res.status(401).send("Unauthorized");

  }
}

module.exports = { IsLoggedIn };