const Application = require('../models/Application');
const Job = require('../models/Job');

exports.listApplications = async (req, res) => {
  const apps = await Application.find().populate('jobId applicantId').lean();
  res.json(apps);
};

exports.createApplication = async (req, res) => {
  const { jobId } = req.body;
  const applicantId = req.user._id;
  const applicantName = req.user.name;
  const job = await Job.findById(jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  const application = await Application.create({ ...req.body, applicantId, applicantName });
  job.applicantsCount += 1;
  await job.save();
  res.json(application);
};

exports.updateApplication = async (req, res) => {
  const app = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(app);
};