const router = require('express').Router()
const adminController = require('../controllers/admin.controller')
const validationMiddleware = require('../middlewares/validation.middleware')
const rolesMiddleware = require('../middlewares/roles.middleware')
const adminSchema = require('../validations/admin.schema')

// GET
router.get('/test', adminController.Test)

router.get('/default',
    rolesMiddleware(['admin']),
    adminController.Default)

// PUT
router.put('/edit/status',
    rolesMiddleware(['admin']),
    validationMiddleware(adminSchema.editStatus, 'body'),
    adminController.editStatus)

<<<<<<< HEAD
// DELETE
// router.delete('/user/:email', adminController.deleteUser)

module.exports = router
=======
module.exports = router
>>>>>>> fb552bde9e0f17681e4805a1aebd2ac24034cef1
