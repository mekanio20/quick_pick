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
    imageMiddleware(process.env.PLACES_PATH).single('logo'),
    validationMiddleware(placeSchema.placeRegister, 'body'),
    placeController.placeRegister)

router.post('/add/album',
    authMiddleware,
    rolesMiddleware(['place']),
    imageMiddleware(process.env.PLACES_PATH)
    .fields([ { name: "photo", maxCount: 5 } ]),
    placeController.placeAddAlbum)

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