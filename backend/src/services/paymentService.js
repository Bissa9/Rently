const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/bookingModel');

const processPayment = async (userId, bookingId, amount, cardDetails = {}) => {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return { success: false, message: 'Booking not found' };
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: { bookingId, userId },
    });

    booking.paymentIntentId = paymentIntent.id;
    booking.paymentStatus = 'paid';
    await booking.save();

    return {
      success: true,
      message: 'Payment successful',
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const refundPayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    return {
      success: true,
      message: 'Refund successful',
      refundId: refund.id,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

module.exports = {
  processPayment,
  refundPayment,
};
