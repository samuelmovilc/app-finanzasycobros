const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactions.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', transactionsController.getAll);
router.post('/', transactionsController.create);

module.exports = router;
