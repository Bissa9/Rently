const mongoose = require("mongoose");
const Review = require("../models/reviewModel.js");
const Booking = require("../models/bookingModel.js");
const Car = require("../models/carModel.js");

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  CREATED: 201,
  OK: 200,
};

const createReview = async (req, res) => {
  try {
    const { carId, comment, rating } = req.body;
    const userId = req.user._id;

    if (!comment || comment.trim().length < 10) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Comment must be at least 10 characters long.",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid car ID",
      });
    }

    const booking = await Booking.findOne({
      user: userId,
      car: carId,
      endDate: { $lt: new Date() },
      status: "completed",
    });

    if (!booking) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "You can only review a car after completing a rental.",
      });
    }

    const existingReview = await Review.findOne({ user: userId, car: carId });
    if (existingReview) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "You have already reviewed this car.",
      });
    }

    const review = new Review({
      car: carId,
      user: userId,
      comment,
      rating,
    });

    await review.save();
    const populatedReview = await Review.findById(review._id).populate(
      "user",
      "name"
    );

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Review submitted successfully",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Failed to create review:", error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to submit review due to a server error",
      error: error.message,
    });
  }
};

const getCarReviews = async (req, res) => {
  try {
    const { carId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid car ID",
      });
    }

    const reviews = await Review.find({ car: carId })
      .populate("user", " _id firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ success: true, data: reviews });
  } catch (error) {
    console.error("Failed to fetch car reviews:", error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch car reviews",
      error: error.message,
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, rating } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Review not found",
      });
    }
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "You are not authorized to update this review.",
      });
    }

    review.comment = comment || review.comment;
    review.rating = rating || review.rating;
    await review.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error("Failed to update review:", error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update review",
      error: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "You are not authorized to delete this review.",
      });
    }

    await review.deleteOne();

    res
      .status(HTTP_STATUS.OK)
      .json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error("Failed to delete review:", error.message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to delete review",
      error: error.message,
    });
  }
};

module.exports = {
  createReview,
  getCarReviews,
  updateReview,
  deleteReview,
};
