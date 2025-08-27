const Application = require('../models/Application');
const Job = require('../models/Job');

exports.getAnalytics = async (req, res) => {
  // Most popular job
  const jobs = await Job.find();
  const applications = await Application.aggregate([
    { $group: { _id: "$jobId", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  const applicationsByJob = await Promise.all(applications.map(async (a) => ({
    title: (await Job.findById(a._id))?.title || "Unknown",
    count: a.count
  })));
  res.json({
    mostPopularJob: applicationsByJob[0]?.title || "-",
    highestApplications: applicationsByJob[0]?.count || "-",
    bestMatchRate: await Application.aggregate([{ $group: { _id: null, max: { $max: "$matchScore" } } }])
      .then(r => (r[0]?.max || 0).toFixed(1)),
    applicationsByJob,
  });
};