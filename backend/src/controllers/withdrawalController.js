const User = require('../models/userModel');
const { protect, isCarOwner } = require('../middlewares/authMiddleware');

const requestWithdrawal = async (req, res) => {
    try {
      const { amount, method, details } = req.body;
      const ownerId = req.user.id;
  
      //fisrt validate withdrawal amount
      if (amount <= 0) {
        return res.status(400).json({ message: "Amount must be positive" });
      }

    //   if (amount < MIN_WITHDRAWAL || amount > MAX_WITHDRAWAL) {
    //     return res.status(400).json({
    //       message: `Amount must be between ${MIN_WITHDRAWAL} and ${MAX_WITHDRAWAL}`
    //     });
    //   }
  
      //then I use findByIdAndUpdate to avoid validation issues
      const updatedUser = await User.findByIdAndUpdate(
        ownerId,
        {
          $inc: { profitBalance: -amount },
          $push: {
            withdrawalRequests: {
              amount,
              method,
              details,
              status: 'pending'
            }
          }
        },
        { new: true, runValidators: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({
        message: "Withdrawal request submitted",
        newBalance: updatedUser.profitBalance,
        requestId: updatedUser.withdrawalRequests.slice(-1)[0]._id
      });
    } catch (error) {
      console.error("Withdrawal error:", error);
      res.status(500).json({ 
        message: "Withdrawal failed", 
        error: error.message 
      });
    }
  };

const getWithdrawalHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('withdrawalRequests profitBalance');
      
    res.json({
      balance: user.profitBalance,
      withdrawals: user.withdrawalRequests
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching history", 
      error: error.message 
    });
  }
};

module.exports = {
  requestWithdrawal,
  getWithdrawalHistory
};