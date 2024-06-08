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
    searchControl: Joi.object({
        q: Joi.string().max(255).required()
    }),
    queryControl: Joi.object({
        page: Joi.number().positive().optional(),
        limit: Joi.number().positive().optional(),
        order: Joi.string().valid('asc', 'desc').optional()
    })
}

module.exports = baseSchema