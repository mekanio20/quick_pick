const Joi = require('joi')

const adminSchema = {
    addCategory: Joi.object({
        name: Joi.string().max(255).required(),
    }),
    editStatus: Joi.object({
        id: Joi.number().positive().required(),
        isActive: Joi.boolean().required()
    })
}

module.exports = adminSchema