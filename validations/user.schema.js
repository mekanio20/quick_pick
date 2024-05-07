const Joi = require('joi')

const userSchema = {
    userRegister: Joi.object({
        email: Joi.string().max(100).email().required(),
        fullname: Joi.string().max(100).optional(),
        username: Joi.string().max(100).optional(),
        phone: Joi.string().max(50).optional(),
        password: Joi.string().min(4).max(25).regex(/^[a-zA-Z0-9!?^.,_@#$%&*:;=+]{4,25}$/).required()
    }),
    userLogin: Joi.object({
        email: Joi.string().max(100).email().required(),
        password: Joi.string().min(4).max(25).regex(/^[a-zA-Z0-9!?^.,_@#$%&*:;=+]{4,25}$/).required()
    })
}

module.exports = userSchema