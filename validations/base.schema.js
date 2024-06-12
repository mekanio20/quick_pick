const Joi = require('joi')

const baseSchema = {
    idControl: Joi.object({
        id: Joi.number().positive().required()
    }),
    slugControl: Joi.object({
        slug: Joi.string().max(255).required()
    }),
    checkControl: Joi.object({
       code: Joi.string().max(6).required()
    }),
    nameControl: Joi.object({
        name: Joi.string().max(255).required()
    }),
    searchControl: Joi.object({
        q: Joi.string().max(255).required()
    }),
    loginControl: Joi.object({
        email: Joi.string().max(100).email().required(),
        // password: Joi.string().min(4).max(25).regex(/^[a-zA-Z0-9!?^.,_@#$%&*:;=+]{4,25}$/).required()
    }),
    distanceControl: Joi.object({
        lat: Joi.number().positive().optional(),
        lon: Joi.number().positive().optional()
    }),
    queryControl: Joi.object({
        page: Joi.number().positive().optional(),
        limit: Joi.number().positive().optional(),
        order: Joi.string().valid('asc', 'desc').optional()
    })
}

module.exports = baseSchema