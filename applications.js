const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

router.get('/', applicationController.listApplications);
router.post('/', applicationController.createApplication);
router.put('/:id', applicationController.updateApplication);

module.exports = router;