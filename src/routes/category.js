const express = require('express');
const router = express.Router();
const { create, list, read, remove } = require('../controllers/category');

// validators
const { runValidation } = require('../validators');
const { categoryCreateValidator } = require('../validators/category');
const { xApi } = require('../controllers/auth');


router.get('/categories', list);
router.get('/category/:slug', read);


router.post('/category', xApi,categoryCreateValidator, runValidation, create);
router.delete('/category/:slug', xApi , remove);

module.exports = router;