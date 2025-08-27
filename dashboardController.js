const Job = require('../models/Job');
const Application = require('../models/Application');

exports.getDashboard = async (req, res) => {
  const totalJobs = await Job.countDocuments();
  const totalApplicants = await Application.distinct('applicantId').then(arr => arr.length);
  const avgMatch = await Application.aggregate([{ $group: { _id: null, avg: { $avg: "$matchScore" } } }])
    .then(r => (r[0]?.avg || 0).toFixed(1));
  const pendingReviews = await Application.countDocuments({ status: 'pending' });
  const recentApplications = await Application.find().sort({ appliedAt: -1 }).limit(5).populate('jobId').lean();
  res.json({
    stats: { totalJobs, totalApplicants, avgMatch, pendingReviews },
    recentApplications,
  });
};