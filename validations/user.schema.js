const Joi = require('joi')

const userSchema = {
    userRegister: Joi.object({
        phone: Joi.string().max(20).required(),
        email: Joi.string().max(100).email().required(),
        username: Joi.string().max(50).required(),
        firstname: Joi.string().max(50).required(),
        lastname: Joi.string().max(50).required(),
        password: Joi.string().min(4).max(25).regex(/^[a-zA-Z0-9!?^.,_@#$%&*:;=+]{4,25}$/).required()
    }),
    userLogin: Joi.object({
        email: Joi.string().max(100).email().required(),
        password: Joi.string().min(4).max(25).regex(/^[a-zA-Z0-9!?^.,_@#$%&*:;=+]{4,25}$/).required()
    })
}

module.exports = userSchema