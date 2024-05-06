const Joi = require('joi')

const baseSchema = {
    slugControl: Joi.object({
        slug: Joi.string().max(255).required()
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