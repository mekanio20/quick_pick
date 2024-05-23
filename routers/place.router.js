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
    validationMiddleware(placeSchema.placeRegister, 'body'),
    placeController.placeRegister) 

router.post('/login',
    limitterMiddleware(),
    validationMiddleware(placeSchema.placeLogin, 'body'),
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
    validationMiddleware(placeSchema.placeAddCategory, 'body'),
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
    rolesMiddleware(['place']),
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

router.get('/:slug',
    validationMiddleware(baseSchema.slugControl, 'params'),
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
    imageMiddleware(process.env.MEAL_PATH).single('img'),
    validationMiddleware(placeSchema.placeEditMeal, 'body'),
    placeController.placeEditMeal)

router.put('/edit/punchcard',
    authMiddleware,
    rolesMiddleware(['place']),
    validationMiddleware(placeSchema.placeEditPunchcard, 'body'),
    placeController.placeEditPunchcard)

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

module.exports = router