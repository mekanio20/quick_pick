const router = require('express').Router()
const userController = require('../controllers/user.controller')
const limitterMiddleware = require('../middlewares/limitter.middleware')
const validationMiddleware = require('../middlewares/validation.middleware')
const imageMiddleware = require('../middlewares/image.middleware')
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

router.post('/check',
    limitterMiddleware(),
    otpMiddleware,
    validationMiddleware(baseSchema.checkControl, 'body'),
    userController.userCheck)

router.post('/add/basket',
    authMiddleware,
    rolesMiddleware(['user']),
    validationMiddleware(userSchema.userBasketAdd, 'body'),
    userController.userAddBasket)

router.post('/add/payment',
    authMiddleware,
    rolesMiddleware(['user']),
    validationMiddleware(userSchema.userAddPayment, 'body'),
    userController.userAddPayment)

// PUT
router.put('/update/profile',
    authMiddleware,
    rolesMiddleware(['user']),
    imageMiddleware(process.env.USER_PATH).single('img'),
    validationMiddleware(userSchema.userUpdateProfile, 'body'),
    userController.userUpdateProfile)

router.put('/update/basket',
    authMiddleware,
    rolesMiddleware(['user']),
    validationMiddleware(userSchema.userBasketEdit, 'body'),
    userController.userUpdateBasket)

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

router.get('/basket',
    authMiddleware,
    rolesMiddleware(['user']),
    userController.fetchBasket)

router.get('/order',
    authMiddleware,
    rolesMiddleware(['user']),
    userController.fetchOrder)

router.get('/order/detail/:id',
    authMiddleware,
    rolesMiddleware(['user']),
    validationMiddleware(baseSchema.idControl, 'params'),
    userController.fetchOrderDetail)

router.get('/order/history',
    authMiddleware,
    rolesMiddleware(['user']),
    userController.fetchOrderHistory)

router.get('/claim',
    authMiddleware,
    rolesMiddleware(['user']),
    validationMiddleware(userSchema.userClaim, 'query'),
    userController.userClaim)

// DELETE
router.delete('/basket/:id',
    authMiddleware,
    rolesMiddleware(['user']),
    validationMiddleware(baseSchema.idControl, 'params'),
    userController.userDeleteBasket)

module.exports = router