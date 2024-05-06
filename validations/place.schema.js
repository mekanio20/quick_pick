const Joi = require('joi')

const placeSchema = {
    placeLogin: Joi.object({
        email: Joi.string().max(100).email().required(),
        password: Joi.string().min(4).max(25).regex(/^[a-zA-Z0-9!?^.,_@#$%&*:;=+]{4,25}$/).required()
    }),
    placeRegister: Joi.object({
        name: Joi.string().max(100).required(),
        type: Joi.string().valid('Cafe', 'Bakery', 'Restaurant', 'Bar').required(),
        password: Joi.string().min(4).max(25).regex(/^[a-zA-Z0-9!?^.,_@#$%&*:;=+]{4,25}$/).required(),
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
    }),
    placeAddCategory: Joi.object({
        name: Joi.string().max(255).required()
    }),
    placeAddSchedule: Joi.object({
        day: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').required(),
        open_time: Joi.string().max(50).required(),
        close_time: Joi.string().max(50).required()
    }),
    placeAddCategory: Joi.object({
        name: Joi.string().max(255).required()
    }),
    placeAddMeal: Joi.object({
        name: Joi.string().max(255).required(),
        desc: Joi.string().max(255).optional(),
        price: Joi.number().positive().required(),
        point: Joi.number().positive().optional(),
        time: Joi.string().max(10).required(),
        type: Joi.string().valid('Meat', 'Vegan', 'Kosher', 'Vegetarian', 'Halal', 'Gluten Free'),
        placeCategoryId: Joi.number().positive().required()
    }),
    placeAddAllergen: Joi.object({
        name: Joi.string().max(255).required(),
        mealId: Joi.number().positive().required()
    }),
    placeAddMealSize: Joi.object({
        size: Joi.string().valid('Small', 'Medium', 'Large').required(),
        price: Joi.number().positive().required(),
        mealId: Joi.number().positive().required()
    }),
    placeAddMealExtra: Joi.object({
        name: Joi.string().max(255).required(),
        price: Joi.number().positive().required(),
        mealId: Joi.number().positive().required()
    }),
    placeAddPunchcard: Joi.object({
        name: Joi.string().max(255).required(),
        point: Joi.number().positive().required(),
        mealId: Joi.number().positive().required()
    }),
}

module.exports = placeSchema