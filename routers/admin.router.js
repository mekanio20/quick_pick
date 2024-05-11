const router = require('express').Router()
const adminController = require('../controllers/admin.controller')
const validationMiddleware = require('../middlewares/validation.middleware')
const rolesMiddleware = require('../middlewares/roles.middleware')
const adminSchema = require('../validations/admin.schema')

// GET
router.get('/test', adminController.Test)

router.get('/default',
    // rolesMiddleware(['admin']),
    adminController.Default)

// PUT
router.put('/edit/status',
    rolesMiddleware(['admin']),
    validationMiddleware(adminSchema.editStatus, 'body'),
    adminController.editStatus)

// DELETE
router.delete('/user/:email', adminController.deleteUser)

module.exports = router
