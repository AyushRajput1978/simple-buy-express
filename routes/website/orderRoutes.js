const express = require('express');
const authController = require('../../controller/authController');
const { getUserOrders, updateOrder } = require('../../controller/orderController');

const router = express.Router();

router.get('/', authController.protect, getUserOrders);
router.patch('/:id', authController.protect, updateOrder);
module.exports = router;
