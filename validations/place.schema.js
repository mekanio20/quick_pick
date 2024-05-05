const Joi = require('joi')

const placeSchema = {
    placeRegister: Joi.object({
        name: Joi.string().max(100).required(),
        type: Joi.string().valid('Cafe', 'Bakery', 'Restaurant', 'Bar').required(),
        email: Joi.string().max(100).email().required(),
        phone_primary: Joi.string().max(20).required(),
        address: Joi.string().max(255).required(),
        latitude: Joi.string().max(100).required(),
        longitude: Joi.string().max(100).required()
    }),
    placeEdit: Joi.object({
        name: Joi.string().max(100).optional(),
        type: Joi.string().valid('Cafe', 'Bakery', 'Restaurant', 'Bar').optional(),
        desc: Joi.string().optional(),
        phone_primary: Joi.string().max(20).optional(),
        phone_secondary: Joi.string().max(20).optional(),
        address: Joi.string().max(255).optional(),
        latitude: Joi.string().max(100).optional(),
        longitude: Joi.string().max(100).optional(),
        website: Joi.string().max(100).uri({ scheme: ['http', 'https'] }).optional(),
        zipcode: Joi.string().max(50).optional(),
        color: Joi.string().max(50).optional(),
        copacity: Joi.string().valid('Quite', 'Moderate', 'Busy').optional(),
        dine_in: Joi.boolean().optional(),
        tax: Joi.number().positive().optional(),
        open_close: Joi.boolean().optional(),
        auto_accept: Joi.boolean().optional()
    })
}

module.exports = placeSchema