const express = require('express');
const router = express.Router();
const {
    create,
    list,
    listAllBlogsCategoriesTags,
    read,
    remove,
    update,
    photo,
    listRelated,
    listSearch,
    blogsByCategory,
    
} = require('../controllers/blog');
const { xApi } = require('../controllers/auth');
const cleanCache = require('../middleware/cleanCache');


router.post('/blog', xApi, cleanCache,create);
router.get('/blogs', list);
router.post('/blogs-categories-tags', listAllBlogsCategoriesTags);
router.post('/blogsByCategory', blogsByCategory);
router.get('/blog/:slug', read);
router.delete('/blog/:slug', xApi,remove);
router.get('/blog/photo/:slug', photo);
router.post('/blogs/related', listRelated);
router.get('/blogs/search', listSearch);

// auth user blog crud
// router.post('/user/blog',  create);
// router.delete('/user/blog/:slug' , remove);

module.exports = router;