const router = require('express').Router()
const userRouter = require('./user.router')
const placeRouter = require('./place.router')
const adminRouter = require('./admin.router')

router.use('/admin', adminRouter)
router.use('/user', userRouter)
router.use('/place', placeRouter)

module.exports = router