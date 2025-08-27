const express = require('express');
const router = express.Router();

// Example endpoint
router.get('/', (req, res) => {
  res.json({ message: 'Dashboard route works!' });
});

module.exports = router;