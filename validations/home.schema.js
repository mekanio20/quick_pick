const Joi = require('joi')

const homeSchema = {
    homeMain: Joi.object({
        cat: Joi.number().positive().max(10).optional(),
        startPrice: Joi.number().positive().max(1000).optional(),
        endPrice: Joi.number().positive().max(1000).optional(),
        type: Joi.string().valid('Meat', 'Vegan', 'Kosher', 'Vegetarian', 'Halal', 'Gluten Free').optional()
    }),
    searchMain: Joi.object({
        q: Joi.string().max(255).required()
    })
}

module.exports = homeSchema