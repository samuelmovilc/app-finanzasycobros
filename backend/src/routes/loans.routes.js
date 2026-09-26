const express = require('express');
const router = express.Router();
const loansController = require('../controllers/loans.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', loansController.getAll);
router.post('/', loansController.create);
router.put('/:id/status', loansController.updateStatus);
router.get('/:id/payments', loansController.getPayments);
router.post('/:id/payments', loansController.createPayment);

module.exports = router;
