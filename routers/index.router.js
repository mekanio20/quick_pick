const router = require('express').Router()
const userRouter = require('./user.router')
const placeRouter = require('./place.router')

router.use('/user', userRouter)
router.use('/place', placeRouter)

module.exports = router