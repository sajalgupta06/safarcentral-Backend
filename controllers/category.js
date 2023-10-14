const Category = require('../models/category');
const Blog = require('../models/blog');
const slugify = require('slugify');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.create =async (req, res) => {
    const { name } = req.body;
    let slug = slugify(name).toLowerCase();

    const check = await Category.findOne({slug:slug})


    if(check){
        return res.status(400).json("Category Already Exists")

    }

    let category = new Category({ name, slug });

   const savedCategory =  await category.save()

    if(savedCategory)
    {
     return res.json(savedCategory)
    }
 
     return res.status(400).json({
         error: errorHandler("Error Occured")
     });
};

exports.list = async (req, res) => {
   const categories = await Category.find({})

   if(categories)
   {
    return res.status(200).json({statusCode: "200",data:categories})
   }

    return res.status(400).json({
        error: errorHandler("Error Occured")
    });
};

exports.read = async(req, res) => {
    const slug = req.params.slug.toLowerCase();

   const category =  await Category.findOne({ slug })
  if(!category)
  {

      return res.status(400).json({
          error: errorHandler("Error Occured")
        });
    }
        // res.json(category);
       const blogs = await  Blog.find({ categories: category })
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .select('_id title slug excerpt categories postedBy tags createdAt updatedAt')
            if(!blogs)
            {
                return res.status(400).json({
                    error: errorHandler("Error Occured")
                  }); 
            }

           return res.json({ category: category, blogs: data });

};

exports.remove = async(req, res) => {
    const slug = req.params.slug.toLowerCase();

   const category = await Category.findOneAndRemove({ slug })

    if(category)
    {
        return res.status(400).json({
            error: errorHandler("Error Occured")
        });
    }

    return   res.json({
        message: 'Category deleted successfully'
    });
};