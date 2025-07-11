const express = require('express');
const { 
  requestWithdrawal,
  getWithdrawalHistory
} = require('../controllers/withdrawalController');
const { protect, isCarOwner } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/request', protect, isCarOwner, requestWithdrawal);
router.get('/history', protect, isCarOwner, getWithdrawalHistory);

module.exports = router;
