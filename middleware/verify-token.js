const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    // decoded will return an error or the payload from the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // add users info (username, _id) onto the request so we can use it
    // in things like Task.find({owner: req.user._id})
    req.user = decoded.payload;

    next()
  } catch (error) {
    res.status(401).json({ err: error.message });
  }
}

module.exports = verifyToken;
