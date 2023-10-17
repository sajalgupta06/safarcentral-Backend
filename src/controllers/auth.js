exports.xApi = (req, res, next) => {

  req.apiKey = req.headers["x-api-key"]
  console.log(req.apiKey)

  const apiKey = process.env.xApiKey;

  if (req.apiKey != apiKey) {
    return res.status(400).json({
      error: "Invalid Api Key",
    });
  }
  next();
};
