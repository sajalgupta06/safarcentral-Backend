const { clearCache } = require("../lib/cache");

module.exports = async (req,res,next)=>{
await next();

clearCache("allBlogs")
}