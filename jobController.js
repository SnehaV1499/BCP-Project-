const Job = require('../models/Job');
const Application = require('../models/Application');

exports.listJobs = async (req, res) => {
  const jobs = await Job.find().lean();
  res.json(jobs);
};

exports.createJob = async (req, res) => {
  const job = await Job.create({ ...req.body, createdBy: req.user._id });
  res.json(job);
};

exports.getJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  res.json(job);
};

exports.updateJob = async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(job);
};

exports.deleteJob = async (req, res) => {
  await Job.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};