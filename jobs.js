const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Add auth middleware if needed
router.get('/', jobController.listJobs);
router.post('/', jobController.createJob);
router.get('/:id', jobController.getJob);
router.put('/:id', jobController.updateJob);
router.delete('/:id', jobController.deleteJob);


// Replace this with your actual Job model
const Job = require('../models/Job');

// POST /api/jobs - Create a new job
router.post('/', async (req, res) => {
  try {
    const { title, description, location } = req.body;
    const newJob = new Job({ title, description, location });
    await newJob.save();
    res.status(201).json(newJob);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/jobs - Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;