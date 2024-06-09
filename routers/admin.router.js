const router = require('express').Router()
const adminController = require('../controllers/admin.controller')
const validationMiddleware = require('../middlewares/validation.middleware')
const rolesMiddleware = require('../middlewares/roles.middleware')
const adminSchema = require('../validations/admin.schema')
const baseSchema = require('../validations/base.schema')

// GET
router.get('/default',
    rolesMiddleware(['admin']),
    adminController.Default)

// POST
router.post('/add/category',
    rolesMiddleware(['admin']),
    validationMiddleware(adminSchema.addCategory, 'body'),
    adminController.addCategory)

// PUT
router.put('/edit/status',
    rolesMiddleware(['admin']),
    validationMiddleware(adminSchema.editStatus, 'body'),
    adminController.editStatus)

// DELETE
router.delete('/delete/category/:id',
    rolesMiddleware(['admin']),
    validationMiddleware(baseSchema.idControl, 'params'),
    adminController.deleteCategory)

module.exports = router
