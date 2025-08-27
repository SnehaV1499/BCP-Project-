const Message = require('../models/Message');

exports.listMessages = async (req, res) => {
  const messages = await Message.find({
    $or: [
      { senderId: req.user._id },
      { receiverId: req.user._id }
    ]
  }).populate('senderId receiverId').lean();
  res.json(messages);
};

exports.sendMessage = async (req, res) => {
  const { receiverId, message } = req.body;
  const msg = await Message.create({
    senderId: req.user._id,
    receiverId,
    message,
  });
  res.json(msg);
};