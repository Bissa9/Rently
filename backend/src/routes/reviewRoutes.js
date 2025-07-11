const express = require("express");
const { protect } = require("../middlewares/authMiddleware.js");
const {
  createReview,
  getCarReviews,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController.js");

const router = express.Router();

router.post("/", protect, createReview);
router.get("/car/:carId", getCarReviews);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
