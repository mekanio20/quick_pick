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

router.post('/add/meal',
    authMiddleware,
    rolesMiddleware(['place']),
    imageMiddleware(process.env.FOOD_PATH).single('img'),
    validationMiddleware(placeSchema.placeAddMeal, 'body'),
    placeController.placeAddMeal)

router.post('/add/meal-size',
    authMiddleware,
    rolesMiddleware(['place']),
    validationMiddleware(placeSchema.placeAddMealSize, 'body'),
    placeController.placeAddMealSize)

router.post('/add/meal-extra',
    authMiddleware,
    rolesMiddleware(['place']),
    validationMiddleware(placeSchema.placeAddMealExtra, 'body'),
    placeController.placeAddMealExtra)

router.post('/add/allergen',
    authMiddleware,
    rolesMiddleware(['place']),
    validationMiddleware(placeSchema.placeAddAllergen, 'body'),
    placeController.placeAddAllergen)

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

module.exports = router