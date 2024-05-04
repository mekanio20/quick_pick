const Joi = require('joi')

const userSchema = {
    userRegister: Joi.object({
        phone: Joi.string().max(20).required(),
        email: Joi.string().email().required(),
        username: Joi.string().required(),
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        password: Joi.string().min(4).max(25).regex(/^[a-zA-Z0-9!?^.,_@#$%&*:;=+]{4,25}$/).required()
    }),
    check: Joi.object({ code: Joi.string().required() }),
}

module.exports = userSchema