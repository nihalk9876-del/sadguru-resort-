const db = require('../database/db');

exports.getAllPackages = (req, res) => {
  try {
    const packages = db.getPackages();
    return res.json({ success: true, count: packages.length, packages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPackageById = (req, res) => {
  try {
    const { id } = req.params;
    const pkg = db.getPackageById(id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    return res.json({ success: true, package: pkg });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await db.updatePackage(id, updates);
    return res.json({ success: true, message: 'Package updated successfully', package: updated });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.bookPackage = async (req, res) => {
  try {
    const { packageId, packageName, customerName, phone, email, preferredDate, guests, totalAmount, notes } = req.body;
    if (!customerName || !phone || !preferredDate) {
      return res.status(400).json({ success: false, message: 'Customer details and preferred date are required.' });
    }

    const booking = await db.createPackageBooking({
      packageId,
      packageName,
      customerName,
      phone,
      email,
      preferredDate,
      guests,
      totalAmount,
      notes
    });

    return res.status(201).json({ success: true, message: 'Package reserved successfully!', booking });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.getPackageBookings = (req, res) => {
  try {
    const bookings = db.getPackageBookings();
    return res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
