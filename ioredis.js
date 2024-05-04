const Redis = require('ioredis')
const redis = new Redis({})

redis.on('ready', () => { console.log('Redis connected...') })

module.exports = redis