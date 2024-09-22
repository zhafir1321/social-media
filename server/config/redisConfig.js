const Redis = require("ioredis");

const redis = new Redis({
  port: 16116,
  host: "redis-16116.c334.asia-southeast2-1.gce.redns.redis-cloud.com",
  username: "default",
  password: process.env.REDIS_PASSWORD,
});

module.exports = redis;
