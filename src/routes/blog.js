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


router.post('/blog', create);
router.get('/blogs', list);
router.post('/blogs-categories-tags', listAllBlogsCategoriesTags);
router.post('/blogsByCategory', blogsByCategory);
router.get('/blog/:slug', read);
router.delete('/blog/:slug',remove);
router.put('/blog/:slug',  update); 
router.get('/blog/photo/:slug', photo);
router.post('/blogs/related', listRelated);
router.get('/blogs/search', listSearch);

// auth user blog crud
router.post('/user/blog', create);
router.delete('/user/blog/:slug' , remove);
router.put('/user/blog/:slug' , update);

module.exports = router;