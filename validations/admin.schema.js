const Joi = require('joi')

const adminSchema = {
    editStatus: Joi.object({
        id: Joi.number().positive().required(),
        isActive: Joi.boolean().required()
    })
}

module.exports = adminSchema