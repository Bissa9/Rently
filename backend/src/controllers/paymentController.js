const { processPayment, refundPayment } = require('../services/paymentService');
const Booking = require('../models/bookingModel');

const makePayment = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    const userId = req.user.id;

    const result = await processPayment(userId, bookingId, amount);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.status(200).json({ message: result.message, paymentIntentId: result.paymentIntentId });
  } catch (error) {
    res.status(500).json({ message: 'Payment processing error', error: error.message });
  }
};

const handleRefund = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking || !booking.paymentIntentId) {
      return res.status(404).json({ message: 'Booking or payment not found' });
    }

    const result = await refundPayment(booking.paymentIntentId);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    booking.paymentStatus = 'refunded';
    await booking.save();

    res.status(200).json({ message: result.message, refundId: result.refundId });
  } catch (error) {
    res.status(500).json({ message: 'Refund processing error', error: error.message });
  }
};

module.exports = {
  makePayment,
  handleRefund,
};
