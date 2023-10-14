const Category = require('../models/category');
const Tag = require('../models/tag');
const formidable = require('formidable');
const slugify = require('slugify');
const {stripHtml} = require('string-strip-html');
const _ = require('lodash');
const { errorHandler } = require('../helpers/dbErrorHandler');
const fs = require('fs');
const { smartTrim } = require('../helpers/blog');
const Blog = require('../models/blog');


exports.create = async(req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, async(err, fields, files) => {
        console.log(fields)
        if (err) {
            return res.status(400).json({
                error: 'Image could not upload'
            });
        }

        let { title, body, categories, tags,mdesc,photo } = fields;

        title = title[0];
        body = body[0];
        categories = categories[0];
        photo = photo[0];
        tags = tags[0];
        mdesc = mdesc[0];
       
        
        if (!title || !title.length) {
            return res.status(400).json({
                error: 'title is required'
            });
        }
      
        if (!body || body.length < 100) {
            return res.status(400).json({
                error: 'Content is too short'
            });
        }

        if (!categories || categories.length === 0) {
            return res.status(400).json({
                error: 'At least one category is required'
            });
        }

        // if (!tags || tags.length === 0) {
        //     return res.status(400).json({
        //         error: 'At least one tag is required'
        //     });
        // }

        // const temp_excerpt = stripHtml(body).result
        let blog = new Blog();
        blog.title = title;
        blog.body = body;
        blog.photo = photo;
        blog.slug = slugify(title).toLowerCase();
        blog.mtitle = `${title} | ${process.env.APP_NAME}`;
        // blog.mdesc = stripHtml(body.substring(0, 160)).result;
        blog.mdesc = mdesc
        blog.excerpt = smartTrim(mdesc, 250, ' ', ' ...');

        // categories and tags
        let arrayOfCategories = categories && categories.split(',');
        blog.tags = tags
        
        // let arrayOfTags = tags && tags.split(',');
     

        // if (files.photo) {
        //     if (files.photo.size > 10000000) {
        //         return res.status(400).json({
        //             error: 'Image should be less then 1mb in size'
        //         });
        //     }

        //     blog.photo.data = fs.readFileSync(files.photo.path);
        //     blog.photo.contentType = files.photo.type;
         
        // }

         const result = await blog.save()

            if (!result) {
                return res.status(400).json({
                    error: "Error while Saving"
                });
            }
            // res.json(result);

            
    const pushCategory = await Blog.findByIdAndUpdate(result._id, { $push: { categories: arrayOfCategories } }, { new: true })
        
        if(!pushCategory)
        {
            return res.status(400).json({
                error: "Error while Saving Category"
            });
        }


        // const pushTags = await Blog.findByIdAndUpdate(result._id, { $push: { tags: arrayOfTags } }, { new: true })

        //     if(!pushTags)
        //     {
        //         return res.status(400).json({
        //             error: "Error while Saving Tag"
        //         });
        //     }

           return res.json(pushCategory)
        })
};

// list, listAllBlogsCategoriesTags, read, remove, update

exports.list = async (req, res) => {
     const blogs = await Blog.find({})
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .select('_id title slug photo excerpt mdesc  categories tags  createdAt updatedAt ').sort({"updatedAt":-1})

        if(blogs)
        {
            return res.json({statusCode:"200",data:blogs})
        }
        else{
            return res.json({error:"Error Occurred"})
        }
};

exports.listAllBlogsCategoriesTags = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 10;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    let blogs;
    let categories;
    let tags;

    Blog.find({})
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('_id title slug excerpt categories tags photo createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            blogs = data; // blogs
            // get all categories
            Category.find({}).exec((err, c) => {
                if (err) {
                    return res.json({
                        error: errorHandler(err)
                    });
                }
                categories = c; // categories
                // get all tags
                Tag.find({}).exec((err, t) => {
                    if (err) {
                        return res.json({
                            error: errorHandler(err)
                        });
                    }
                    tags = t;
                    // return all blogs categories tags
                    res.json({ blogs, categories, tags, size: blogs.length });
                });
            });
        });
};

exports.blogsByCategory = async(req,res)=>{

    const categoryId = req.body.categoryId
    const blogs = await  Blog.find({categories: { $in: categoryId } })
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .select('_id title slug photo excerpt  mdesc  categories tags  createdAt updatedAt ')

  
    if(blogs)
    {
        return res.json({statusCode:"200",data:blogs})
    }
    else{
        return res.json({error:"Error Occurred"})
    }
}

exports.read = async(req, res) => {
    const slug = req.params.slug.toLowerCase();
   const blog = await  Blog.findOne({ slug })
        // .select("-photo")
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .select('_id title body photo slug mtitle mdesc categories tags  createdAt updatedAt')
       
        if(!blog)
        {
            return res.json({
                error: "Error Occured"
            });
        }
       return res.json({statusCode:"200",data:blog});
};

exports.remove = async(req, res) => {
    const slug = req.params.slug.toLowerCase();
    const exists = await  Blog.findOneAndRemove({ slug })

    if(!exists)
    {
        return res.json({
            error: "Error Occured"
        });
    }

    return res.json({
        message: 'Blog deleted successfully'
    });
};

exports.update = async (req, res) => {
    const slug = req.params.slug.toLowerCase();

     const oldBlog = await Blog.findOne({ slug })

     if(!oldBlog)
     {
        return res.status(400).json({
            error: "Error Occured"
        });
     }

        let form = new formidable.IncomingForm();
        form.keepExtensions = true;

        form.parse(req, async(err, fields, files) => {
            if (err) {
                return res.status(400).json({
                    error: 'Image could not upload'
                });
            }

            let slugBeforeMerge = oldBlog.slug;
            oldBlog = _.merge(oldBlog, fields);
            oldBlog.slug = slugBeforeMerge;

            const { body, desc, categories, tags } = fields;

            if (body) {
                oldBlog.excerpt = smartTrim(body, 320, ' ', ' ...');
                oldBlog.mdesc = stripHtml(body.substring(0, 160));
            }

            if (categories) {
                oldBlog.categories = categories.split(',');
            }

            if (tags) {
                oldBlog.tags = tags.split(',');
            }

            // if (files.photo) {
            //     if (files.photo.size > 10000000) {
            //         return res.status(400).json({
            //             error: 'Image should be less then 1mb in size'
            //         });
            //     }
            //     oldBlog.photo.data = fs.readFileSync(files.photo.path);
            //     oldBlog.photo.contentType = files.photo.type;
            // }

                const saveBlog = await oldBlog.save()

                if(!saveBlog)
                {
                    return res.status(400).json({
                        error: "Error While Saving"
                    });
    
                }
                return res.json(result);
        });
        
       
};

exports.photo = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOne({ slug })
        .select('photo')
        .exec((err, blog) => {
            if (err || !blog) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', blog.photo.contentType);
            return res.send(blog.photo.data);
        });
};

exports.listRelated = (req, res) => {
    // console.log(req.body.blog);
    let limit = req.body.limit ? parseInt(req.body.limit) : 3;
    const { _id, categories } = req.body.blog;

    Blog.find({ _id: { $ne: _id }, categories: { $in: categories } })
        .limit(limit)
        .select('title slug excerpt photo createdAt updatedAt')
        .exec((err, blogs) => {
            if (err) {
                return res.status(400).json({
                    error: 'Blogs not found'
                });
            }
            res.json(blogs);
        });
};

//
exports.listSearch = (req, res) => {
    console.log(req.query);
    const { search } = req.query;
    if (search) {
        Blog.find(
            {
                $or: [{ title: { $regex: search, $options: 'i' } }, { body: { $regex: search, $options: 'i' } }]
            },
            (err, blogs) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json(blogs);
            }
        ).select('-photo -body');
    }
};

