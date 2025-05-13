// middleware/flagDashboard.js
module.exports = (req, res, next) => {
  req.isDashboard = true;
  next();
};
