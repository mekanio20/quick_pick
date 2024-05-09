const Joi = require('joi')

const homeSchema = {
    homeMain: Joi.object({
        cat: Joi.number().positive().max(10).optional(),
        startPrice: Joi.number().positive().max(1000).optional(),
        endPrice: Joi.number().positive().max(1000).optional()
    })
}

module.exports = homeSchema