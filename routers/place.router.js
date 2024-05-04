const router = require('express').Router()
const placeController = require('../controllers/place.controller')

router.post('/', placeController)

module.exports = router