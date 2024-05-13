const Joi = require('joi')

const userSchema = {
    userRegister: Joi.object({
        email: Joi.string().max(100).email().required(),
        fullname: Joi.string().max(100).optional(),
        username: Joi.string().max(100).optional(),
        phone: Joi.string().max(50).optional(),
        // password: Joi.string().min(4).max(25).regex(/^[a-zA-Z0-9!?^.,_@#$%&*:;=+]{4,25}$/).required()
    }),
    userLogin: Joi.object({
        email: Joi.string().max(100).email().required()
        // password: Joi.string().min(4).max(25).regex(/^[a-zA-Z0-9!?^.,_@#$%&*:;=+]{4,25}$/).required()
    }),
    userUpdateProfile: Joi.object({
        email: Joi.string().max(100).email().optional(),
        password: Joi.string().min(4).max(25).regex(/^[a-zA-Z0-9!?^.,_@#$%&*:;=+]{4,25}$/).optional(),
        fullname: Joi.string().max(100).optional(),
        phone: Joi.string().max(50).optional(),
        birthday: Joi.string().max(50).optional(),
        username: Joi.string().max(100).optional()
    }),
    userBasket: Joi.object({
        mealId: Joi.number().positive().required(),
        count: Joi.number().positive().optional(),
        extra_meals: Joi.array().items(Joi.object({ name: Joi.string().required(), price: Joi.number().positive().required() })).optional(),
        meal_sizes: Joi.array().items(Joi.object({ size: Joi.string().valid('Small', 'Medium', 'Large').required(), price: Joi.number().positive().required() })).optional()
    }),
    userClaim: Joi.object({
        punchcardId: Joi.number().positive().required(),
        placeId: Joi.number().positive().required()
    })
}

module.exports = userSchema