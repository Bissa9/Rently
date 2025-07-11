const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  getLoyaltyProgram,
  redeemPoints,
  addPoints,

} = require("../controllers/loyaltyprog");

router.get("/", protect, getLoyaltyProgram);
router.post("/redeem", protect, redeemPoints);
router.post("/add-points", protect, addPoints);


module.exports = router;
