const router = require('express').Router()
const homeController = require('../controllers/home.controller')
const validationMiddleware = require('../middlewares/validation.middleware')
const homeSchema = require('../validations/home.schema')
const baseSchema = require('../validations/base.schema')

// GET
router.get('/main',
    validationMiddleware(homeSchema.homeMain, 'query'),
    homeController.homeMain)

router.get('/categories', homeController.homeCategories)

router.get('/search',
    validationMiddleware(baseSchema.searchControl, 'query'),
    homeController.searchMain)

module.exports = router