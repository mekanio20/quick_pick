const Joi = require('joi')

const baseSchema = {
    idControl: Joi.object({
        id: Joi.number().positive().required()
    }),
    loginControl: Joi.object({
        phone: Joi.string().required(),
        password: Joi.string().min(4).max(25).regex(/^[a-zA-Z0-9!?^.,_@#$%&*:;=+]{4,25}$/).required(),
    }),
    queryControl: Joi.object({
        page: Joi.number().positive().optional(),
        limit: Joi.ref('page'),
        order: Joi.string().valid('asc', 'desc').optional(),
        status: Joi.string().valid('all', true, false).optional()
    })
}

module.exports = baseSchema