const router = require('express').Router()
const userController = require('../controllers/user.controller')
const limitterMiddleware = require('../middlewares/limitter.middleware')
const validationMiddleware = require('../middlewares/validation.middleware')
const rolesMiddleware = require('../middlewares/roles.middleware')
const authMiddleware = require('../middlewares/auth.middleware')
const otpMiddleware = require('../middlewares/otp.middleware')
const userSchema = require('../validations/user.schema')
const baseSchema = require('../validations/base.schema')

// POST
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

// GET
router.get('/profile',
    authMiddleware,
    rolesMiddleware(['user']),
    userController.userProfile)
    
router.get('/punchcards',
    authMiddleware,
    rolesMiddleware(['user']),
    userController.fetchAllPunchcards)

router.get('/punchcard/:slug',
    authMiddleware,
    rolesMiddleware(['user']),
    validationMiddleware(baseSchema.slugControl, 'params'),
    userController.fetchPunchcard)

router.get('/logout',
    authMiddleware,
    rolesMiddleware(['user']),
    userController.userLogout)

module.exports = router