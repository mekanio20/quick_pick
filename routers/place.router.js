const router = require('express').Router()
const placeController = require('../controllers/place.controller')
const validationMiddleware = require('../middlewares/validation.middleware')
const limitterMiddleware = require('../middlewares/limitter.middleware')
const imageMiddleware = require('../middlewares/image.middleware')
const rolesMiddleware = require('../middlewares/roles.middleware')
const authMiddleware = require('../middlewares/auth.middleware')
const placeSchema = require('../validations/place.schema')
const baseSchema = require('../validations/base.schema')

// POST
router.post('/register',
    limitterMiddleware(),
    rolesMiddleware(['admin']),
    validationMiddleware(placeSchema.placeRegister, 'body'),
    placeController.placeRegister) 

router.post('/login',
    limitterMiddleware(),
    validationMiddleware(baseSchema.loginControl, 'body'),
    placeController.placeLogin)

router.post('/add/album',
    authMiddleware,
    rolesMiddleware(['place']),
    imageMiddleware(process.env.PLACES_PATH)
    .fields([ { name: "photo", maxCount: 5 } ]),
    placeController.placeAddAlbum)

router.post('/add/category',
    authMiddleware,
    rolesMiddleware(['place']),
    validationMiddleware(baseSchema.nameControl, 'body'),
    placeController.placeAddCategory)

router.post('/add/schedule',
    authMiddleware,
    rolesMiddleware(['place']),
    validationMiddleware(placeSchema.placeAddSchedule, 'body'),
    placeController.placeAddSchedule)

router.post('/add/meal',
    authMiddleware,
    rolesMiddleware(['place']),
    imageMiddleware(process.env.MEAL_PATH).single('img'),
    validationMiddleware(placeSchema.placeAddMeal, 'body'),
    placeController.placeAddMeal)

router.post('/add/punchcard',
    authMiddleware,
    rolesMiddleware(['place']),
    validationMiddleware(placeSchema.placeAddPunchcard, 'body'),
    placeController.placeAddPunchcard)

router.post('/add/account',
    authMiddleware,
    rolesMiddleware(['admin']),
    validationMiddleware(baseSchema.idControl, 'body'),
    placeController.placeAddAccount)

// GET
router.get('/categories/:slug',
    validationMiddleware(baseSchema.slugControl, 'params'),
    placeController.fetchPlaceCategories)

router.get('/meals',
    validationMiddleware(placeSchema.placeMeals, 'query'),
    placeController.fetchPlaceMeals)

router.get('/meal/:slug',
    validationMiddleware(baseSchema.slugControl, 'params'),
    placeController.fetchPlaceMealDetail)
    
router.get('/recommendations/:slug',
    validationMiddleware(baseSchema.slugControl, 'params'),
    placeController.fetchPlaceRecommendations)

router.get('/profile',
    authMiddleware,
    rolesMiddleware(['place']),
    placeController.fetchPlaceProfile)

router.get('/logout',
    authMiddleware,
    rolesMiddleware(['place']),
    placeController.placeLogout)

router.get('/albums/:slug',
    validationMiddleware(baseSchema.slugControl, 'params'),
    placeController.fetchPlaceAlbums)

router.get('/schedules',
    authMiddleware,
    rolesMiddleware(['place']),
    placeController.fetchPlaceSchedule)

router.get('/punchcards',
    authMiddleware,
    rolesMiddleware(['place']),
    placeController.fetchPlacePunchcards)

router.get('/home',
    authMiddleware,
    rolesMiddleware(['place']),
    placeController.fetchPlaceHome)

router.get('/orders',
    authMiddleware,
    rolesMiddleware(['place']),
    validationMiddleware(baseSchema.queryControl, 'query'),
    placeController.fetchPlaceOrder)

router.get('/order/finished',
    authMiddleware,
    rolesMiddleware(['place']),
    validationMiddleware(baseSchema.queryControl, 'query'),
    placeController.fetchPlaceOrderFinished)

router.get('/order/history',
    authMiddleware,
    rolesMiddleware(['place']),
    validationMiddleware(baseSchema.queryControl, 'query'),
    placeController.fetchPlaceOrderHistory)

router.get('/order/schedule',
    authMiddleware,
    rolesMiddleware(['place']),
    validationMiddleware(baseSchema.queryControl, 'query'),
    placeController.fetchPlaceOrderSchedule)

router.get('/search/item',
    authMiddleware,
    rolesMiddleware(['place']),
    validationMiddleware(baseSchema.searchControl, 'query'),
    placeController.fetchPlaceSearchItem)

router.get('/:slug',
    validationMiddleware(baseSchema.slugControl, 'params'),
    validationMiddleware(baseSchema.distanceControl, 'query'),
    placeController.fetchPlace)

// PUT
router.put('/edit',
    authMiddleware,
    rolesMiddleware(['place']),
    imageMiddleware(process.env.PLACES_PATH).fields([
        { name: "logo", maxCount: 1 },
        { name: "banner", maxCount: 1 },
        { name: "reward", maxCount: 1 }
    ]),
    validationMiddleware(placeSchema.placeEdit, 'body'),
    placeController.placeEdit)

router.put('/edit/album/:id',
    authMiddleware,
    rolesMiddleware(['place']),
    imageMiddleware(process.env.PLACES_PATH).single('img'),
    validationMiddleware(baseSchema.idControl, 'params'),
    placeController.placeEditAlbum)

router.put('/edit/schedule',
    authMiddleware,
    rolesMiddleware(['place']),
    validationMiddleware(placeSchema.placeEditSchedule, 'body'),
    placeController.placeEditSchedule)

router.put('/edit/category',
    authMiddleware,
    rolesMiddleware(['place']),
    validationMiddleware(placeSchema.placeEditCategory, 'body'),
    placeController.placeEditCategory)

router.put('/edit/meal',
    authMiddleware,
    rolesMiddleware(['place']),
    validationMiddleware(placeSchema.placeEditMeal, 'body'),
    placeController.placeEditMeal)

router.put('/edit/meal/image/:id',
    authMiddleware,
    rolesMiddleware(['place']),
    imageMiddleware(process.env.MEAL_PATH).single('img'),
    validationMiddleware(baseSchema.idControl, 'params'),
    placeController.placeEditMealImage)

router.put('/edit/punchcard',
    authMiddleware,
    rolesMiddleware(['place']),
    validationMiddleware(placeSchema.placeEditPunchcard, 'body'),
    placeController.placeEditPunchcard)

router.put('/edit/status/:id',
    authMiddleware,
    rolesMiddleware(['place']),
    validationMiddleware(baseSchema.idControl, 'params'),
    placeController.placeEditStatus)

// DELETE
router.delete('/delete/album/:id',
    authMiddleware,
    rolesMiddleware(['place']),
    validationMiddleware(baseSchema.idControl, 'params'),
    placeController.deleteAlbum)

router.delete('/delete/schedule/:id',
    authMiddleware,
    rolesMiddleware(['place']),
    validationMiddleware(baseSchema.idControl, 'params'),
    placeController.deleteSchedule)

router.delete('/delete/meal/:id',
    authMiddleware,
    rolesMiddleware(['place']),
    validationMiddleware(baseSchema.idControl, 'params'),
    placeController.deleteMeal)

router.delete('/delete/punchcard/:id',
    authMiddleware,
    rolesMiddleware(['place']),
    validationMiddleware(baseSchema.idControl, 'params'),
    placeController.deletePunchcard)

router.delete('/delete/category/:id',
    authMiddleware,
    rolesMiddleware(['place']),
    validationMiddleware(baseSchema.idControl, 'params'),
    placeController.deleteCategory)

router.delete('/delete/account/:id',
    rolesMiddleware(['admin']),
    placeController.deleteAccount)

module.exports = router