const jwt = require("jsonwebtoken")
function isUser(req, res, next) {
  try {
    if (req.cookies.token === "") {
      res.redirect("/login")
    }
    else {
      const data = jwt.verify(req.cookies.token, "bhumii");
      req.user = data;
      
      next();
    }
  }
  catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).send('Token expired. Please log in again.');
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).send('Invalid token. Please log in again.');
    } else {
      return res.redirect("/login");
    }
  }
}

module.exports = { isUser };