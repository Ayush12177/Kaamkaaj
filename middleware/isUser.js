const jwt = require("jsonwebtoken")
function isUser(req, res, next) {
  try {
    if (req.cookies.token === "") {
      res.redirect("/login/user")
    }
    else {
      const data = jwt.verify(req.cookies.token, "bhumii");
      req.user = data;
      
      next();
    }
  }
  catch (err) {

    return res.redirect("/login/user"); // or return res.status(401).send("Unauthorized");

  }
}

module.exports = { isUser };