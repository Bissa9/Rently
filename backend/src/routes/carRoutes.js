const express = require("express");
const mongoose = require("mongoose");
const {
  addCar,
  updateCar,
  deleteCar,
  getCarById,
  getAllCars,
} = require("../controllers/carController");
const { protect } = require("../middlewares/authMiddleware");
const { upload } = require("../config/cloudinary");

const router = express.Router();
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }
  next();
};


router.post("/", protect, upload.array("images", 5), addCar);
router.put("/:id",protect,validateObjectId,upload.array("images", 5), updateCar);
router.delete("/:id", protect, validateObjectId, deleteCar);
router.get("/:id", validateObjectId, getCarById);
router.get("/", getAllCars);

module.exports = router;
