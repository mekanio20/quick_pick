const router = require('express').Router()
const userController = require('../controllers/user.controller')
const limitterMiddleware = require('../middlewares/limitter.middleware')
const validationMiddleware = require('../middlewares/validation.middleware')
const authMiddleware = require('../middlewares/auth.middleware')
const otpMiddleware = require('../middlewares/otp.middleware')
const userSchema = require('../validations/user.schema')
const baseSchema = require('../validations/base.schema')

router.post('/register',
    limitterMiddleware(),
    validationMiddleware(userSchema.userRegister, 'body'),
    userController.userRegister)

router.post('/verification',
    limitterMiddleware(),
    otpMiddleware,
    validationMiddleware(baseSchema.checkControl, 'body'),
    userController.userVerification)

router.post('/login',
    limitterMiddleware(),
    validationMiddleware(userSchema.userLogin, 'body'),
    userController.userLogin)

module.exports = router