// declare module "mongoose" {
//     interface DocumentQuery<
//       T,
//       DocType extends import("mongoose").Document,
//       QueryHelpers = {}
//     > {
//       mongooseCollection: {
//         name: any;
//       };
//       cache(options: any): (DocumentQuery<T[], Document> & QueryHelpers) | any;
//       useCache: boolean;
//       hashKey: string;
//     }
//     interface Query<ResultType, DocType, THelpers = {}, RawDocType = DocType>
//     extends DocumentQuery<any, any> {}
//   }
  
  
  const mongoose = require("mongoose")
  const redis  = require("redis")

  let redisUrl = "redis://127.0.0.1:6379";
  
  
  const client = redis.createClient({ url: redisUrl });
  
  client.connect();
  client.on("connect", function () {
    console.log("Redis Connected");
  });
  
  mongoose.Query.prototype.cache = function (options) {
    // set flag to true
    this.useCache = true;
  
    this.hashKey = JSON.stringify(options.key || "default");
  
    return this;
  };
  
  
  
  const exec = mongoose.Query.prototype.exec;
  
  
  mongoose.Query.prototype.exec = async function overrideExec(...params) {
    // return exec.apply(this, params);
  
  
    if (!this.useCache) return exec.apply(this, params);
  
    const key = JSON.stringify(
      Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name,
      })
    );
  
    try {
      const cacheValue = (await client.HGET(this.hashKey, key)) || "";
      
      if (cacheValue?.length > 0) {
        const cacheObject = JSON.parse(cacheValue);
  
        // return Array.isArray(cacheObject)
        //   ? cacheObject.map(doc => new this.model(doc))
        //   : new this.model(cacheObject);
            console.log("From Redis")
        return cacheObject;
      }
  
      const result = await exec.apply(this, params);
  
      if (result) {
        client.HSET(this.hashKey, key, JSON.stringify(result));
      }
      return result;
    } catch (error) {
      return error;
    }
  };
  
  
 
  
  module.exports = {
    clearCache(hashKey) {
      client.del(JSON.stringify(hashKey));
    },
  };
  