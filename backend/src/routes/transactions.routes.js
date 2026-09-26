const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactions.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/migrate', transactionsController.migrate);
router.get('/', transactionsController.getAll);
router.post('/', transactionsController.create);
router.put('/:id', transactionsController.update);
router.put('/:id/cancel', transactionsController.cancel);

module.exports = router;
