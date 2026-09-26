const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/clients.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', clientsController.getAll);
router.post('/', clientsController.create);
router.put('/:id', clientsController.update);
router.delete('/:id', clientsController.remove);

module.exports = router;
