const Joi = require('joi')

const homeSchema = {
    homeMain: Joi.object({
        cat: Joi.number().positive().max(10).optional(),
        startPrice: Joi.number().positive().max(1000).optional(),
        endPrice: Joi.number().positive().max(1000).optional(),
        type: Joi.string().valid('Meat', 'Vegan', 'Kosher', 'Vegetarian', 'Halal', 'Gluten Free').optional(),
        lat: Joi.number().positive().optional(),
        lon: Joi.number().positive().optional()
    })
}

module.exports = homeSchema