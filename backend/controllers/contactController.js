const db = require('../database/db');

exports.submitInquiry = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !phone || !message) {
      return res.status(400).json({ success: false, message: 'Name, phone, and message are required.' });
    }

    const inquiry = await db.createInquiry({ name, email, phone, subject, message });
    return res.status(201).json({
      success: true,
      message: 'Thank you for reaching out to Sadguru Resort. Our reservation desk will connect with you shortly.',
      inquiry
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.getInquiries = (req, res) => {
  try {
    const inquiries = db.getInquiries();
    return res.json({ success: true, count: inquiries.length, inquiries });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getReviews = (req, res) => {
  try {
    const reviews = db.getReviews();
    return res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
