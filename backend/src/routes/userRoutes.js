const express = require("express");
const {
  getUserProfile,
  getUserById,
  updateUserProfile,
  becomeCarOwner, 
  checkOldPassword,
  updatePassword
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/profile", protect, getUserProfile);
router.get("/:id", getUserById); 
router.put("/update-profile", protect, updateUserProfile);
router.put("/become-car-owner", protect, becomeCarOwner);
router.post('/check-password', protect, checkOldPassword);
router.post('/update-password', protect, updatePassword);

module.exports = router;
