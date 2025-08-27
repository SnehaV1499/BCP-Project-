const express = require('express');
const router = express.Router();

// Example login endpoint
router.post('/login', (req, res) => {
  res.json({ message: 'Auth login route works!' });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Auth logout route works!' });
});

module.exports = router;