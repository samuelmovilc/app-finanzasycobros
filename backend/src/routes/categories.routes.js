const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Endpoint temporal para migracion
router.get('/migrate', categoriesController.migrate);

router.use(authMiddleware);

router.get('/', categoriesController.getAll);
router.post('/', categoriesController.create);
router.delete('/:id', categoriesController.deleteCategory);

module.exports = router;
