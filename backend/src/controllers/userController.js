const User = require("../models/userModel");
const bcrypt = require('bcryptjs');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};
const getUserById = async (req, res) => {
  try {
  
    const user = await User.findById(req.params.id).select("firstName lastName email phone");  
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json(user);  
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.phone = req.body.phone || user.phone;
    user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
    user.address = req.body.address || user.address;

    if (req.body.isCarOwner !== undefined) {
      user.isCarOwner = req.body.isCarOwner;
    }

    if (req.body.drivingLicense) {
      const { number, issuedDate, expiryDate } = req.body.drivingLicense;

      // Only overwrite the provided keys
      if (number !== undefined)     user.drivingLicense.number     = number;
      if (issuedDate !== undefined) user.drivingLicense.issuedDate = issuedDate;
      if (expiryDate !== undefined) user.drivingLicense.expiryDate = expiryDate;
    }
    const updatedUser = await user.save();
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};
const checkOldPassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password'); // need hash
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const match = await bcrypt.compare(req.body.oldPassword, user.password);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Old password is incorrect' });
    }

    res.json({ success: true, message: 'Password verified' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    return res.status(400).json({ success: false, message: 'Both oldPassword and newPassword are required' });

  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: 'Old password is incorrect' });

    // optional: prevent reuse
    if (await bcrypt.compare(newPassword, user.password))
      return res.status(400).json({ success: false, message: 'New password must be different' });

    /* 🔐 hash new password with 10 salt rounds */
    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('updatePassword error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
const becomeCarOwner = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { isCarOwner: true },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "You are now a car owner!",
      data: user,
    });
  } catch (error) {
    console.error("Error becoming a car owner:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to become a car owner",
      error: error.message,
    });
  }
};

module.exports = { getUserProfile,getUserById, updateUserProfile, checkOldPassword,updatePassword ,becomeCarOwner };
