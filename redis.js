const { createClient } = require("redis");

const redisClient = createClient();

redisClient.connect();

console.log("redis connected");

module.exports = redisClient;