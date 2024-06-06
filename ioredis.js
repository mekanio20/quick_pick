const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

redis.on("ready", () => {
  console.log("Redis connected...");
});

module.exports = redis;
