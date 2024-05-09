const router = require('express').Router()
const homeController = require('../controllers/home.controller')
const validationMiddleware = require('../middlewares/validation.middleware')
const rolesMiddleware = require('../middlewares/roles.middleware')
const homeSchema = require('../validations/home.schema')

// GET
router.get('/main',
    validationMiddleware(homeSchema.homeMain, 'query'),
    homeController.homeMain)

router.get('/categories', homeController.homeCategories)

module.exports = router