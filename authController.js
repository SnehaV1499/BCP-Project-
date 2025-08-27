const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: "Invalid credentials" });
  // You might want to set a session or issue a JWT here
  const token = jwt.sign({ _id: user._id, role: user.role }, 'SECRET');
  res.json({ token, user });
};

exports.logout = async (req, res) => {
  // For JWT, client just removes token; for session, destroy session
  res.json({ success: true });
};