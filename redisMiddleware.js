const redisClient = require("./redis");

exports.get = async (req, res, next) => {
  console.log("middleware");
  const data = await redisClient.get("data");
  if (data == null) {
    next();
  } else {
    console.log("Cache hit");
    res.json(JSON.parse(data));
  }
};