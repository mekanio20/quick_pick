const Joi = require('joi')

const baseSchema = {
    idControl: Joi.object({
        id: Joi.number().positive().required()
    }),
    checkControl: Joi.object({
       code: Joi.string().required()
    }),
    queryControl: Joi.object({
        page: Joi.number().positive().optional(),
        limit: Joi.ref('page'),
        order: Joi.string().valid('asc', 'desc').optional(),
        status: Joi.string().valid('all', true, false).optional()
    })
}

module.exports = baseSchema