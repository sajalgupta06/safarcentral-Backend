const Tag = require('../models/tag');
const Blog = require('../models/blog');
const slugify = require('slugify');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.create = async(req, res) => {
    const { name } = req.body;
    let slug = slugify(name).toLowerCase(); 

    let tag = new Tag({ name, slug });

    const savedTag = await tag.save()

    if(!savedTag)
    {
        return res.status(400).json({
            error: "Error Occured"
        });
    }
    return res.json(savedTag); // dont do this res.json({ tag: data });

};

exports.list = async(req, res) => {
    const tags = await Tag.find({})
    if(!tags)
    {
        return res.status(400).json({
            error: "Error Occured"
        });
    }
    return res.json(tags);
};

exports.read = async(req, res) => {
    const slug = req.params.slug.toLowerCase();

    const tag = await Tag.findOne({ slug }).exec()

    if(!tag)
    {
        return res.status(400).json({
            error: 'Tag not found'
        });
    }
        // res.json(tag);
        const blogs = await Blog.find({ tags: tag })
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .select('_id title slug excerpt categories postedBy tags createdAt updatedAt')
            
            if(!blogs)
            {
                if (err) {
                    return res.status(400).json({
                        error: "Error Occured"
                    });
                }
            }
            return res.json({ tag: tag, blogs: blogs });
  
};

exports.remove =async (req, res) => {
    const slug = req.params.slug.toLowerCase();

   const exists = await Tag.findOneAndRemove({ slug })

   if(!exists)
   {
    return res.status(400).json({
        error: "Error while deleting tag"
    });
   }

    return res.json({
        message: 'Tag deleted successfully'
    });
};