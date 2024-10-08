const Joi = require('joi')

const placeSchema = {
    placeRegister: Joi.object({
        name: Joi.string().max(100).required(),
        type: Joi.string().valid('Cafe', 'Bakery', 'Restaurant', 'Bar').required(),
        password: Joi.string().min(4).max(25).regex(/^[a-zA-Z0-9!?^.,_@#$%&*:;=+]{4,25}$/).required(),
        email: Joi.string().max(100).email().required(),
        phone_primary: Joi.string().max(20).required(),
        address: Joi.string().max(255).required(),
        latitude: Joi.string().max(100).required(),
        longitude: Joi.string().max(100).required(),
        categoryId: Joi.number().positive().required()
    }),
    placeEdit: Joi.object({
        name: Joi.string().max(100).optional(),
        email: Joi.string().max(200).optional(),
        type: Joi.string().valid('Cafe', 'Bakery', 'Restaurant', 'Bar').optional(),
        desc: Joi.string().optional(),
        phone_primary: Joi.string().max(20).optional(),
        phone_secondary: Joi.string().max(20).optional(),
        address: Joi.string().max(255).optional(),
        latitude: Joi.string().optional(),
        longitude: Joi.string().optional(),
        website: Joi.string().max(100).uri({ scheme: ['http', 'https'] }).optional(),
        zipcode: Joi.string().max(50).optional(),
        color: Joi.string().max(50).optional(),
        copacity: Joi.string().valid('Quite', 'Moderate', 'Busy').optional(),
        dine_in: Joi.boolean().optional(),
        tax: Joi.number().positive().max(50).optional(),
        open_close: Joi.boolean().optional(),
        auto_accept: Joi.boolean().optional()
    }),
    placeAddSchedule: Joi.object({
        day: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').required(),
        open_time: Joi.string().max(50).required(),
        close_time: Joi.string().max(50).required()
    }),
    placeAddMeal: Joi.object({
        name: Joi.string().max(255).required(),
        price: Joi.number().positive().required(),
        point: Joi.number().positive().optional(),
        time: Joi.number().positive().required(),
        tax: Joi.number().positive().max(50).optional(),
        recomendo: Joi.boolean().optional(),
        ingredients: Joi.string().optional(),
        type: Joi.string().valid('Meat', 'Vegan', 'Kosher', 'Vegetarian', 'Halal', 'Gluten Free').required(),
        extra_meals: Joi.array().items(Joi.object({ name: Joi.string().required(), price: Joi.number().positive().required(), allergens: Joi.array().items(Joi.string()).required() })).optional(),
        meal_sizes: Joi.array().items(Joi.object({ size: Joi.string().valid('Small', 'Medium', 'Large').required(), price: Joi.number().positive().required() })).optional(),        
        allergens: Joi.array().items(Joi.object({ name: Joi.string().required() })).optional(),      
        placeCategoryId: Joi.number().positive().required()
    }),
    placeAddPunchcard: Joi.object({
        name: Joi.string().max(255).required(),
        point: Joi.number().positive().required(),
        mealId: Joi.number().positive().required()
    }),
    placeMeals: Joi.object({
        caf: Joi.string().max(255).required(),
        cat: Joi.string().max(255).optional(),
        page: Joi.number().positive().optional(),
        limit: Joi.number().positive().optional()
    }),
    placeEditSchedule: Joi.object({
        id: Joi.number().positive().required(),
        day: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').optional(),
        open_time: Joi.string().max(50).optional(),
        close_time: Joi.string().max(50).optional()
    }),
    placeEditCategory: Joi.object({
        id: Joi.number().positive().required(),
        name: Joi.string().max(255).required()
    }),
    placeEditMeal: Joi.object({
        id: Joi.number().positive().required(),
        name: Joi.string().max(255).optional(),
        ingredients: Joi.string().optional(),
        price: Joi.number().positive().optional(),
        point: Joi.number().positive().optional(),
        time: Joi.string().max(10).optional(),
        tax: Joi.number().positive().max(50).optional(),
        recomendo: Joi.boolean().optional(),
        type: Joi.string().valid('Meat', 'Vegan', 'Kosher', 'Vegetarian', 'Halal', 'Gluten Free').optional(),
        extra_meals: Joi.array().items(Joi.object({ name: Joi.string().required(), price: Joi.number().positive().required(), allergens: Joi.array().items(Joi.string()).required() })).optional(),
        meal_sizes: Joi.array().items(Joi.object({ size: Joi.string().valid('Small', 'Medium', 'Large').required(), price: Joi.number().positive().required() })).optional(),        
        allergens: Joi.array().items(Joi.object({ name: Joi.string().required() })).optional(),      
        placeCategoryId: Joi.number().positive().optional()
    }),
    placeEditPunchcard: Joi.object({
        id: Joi.number().positive().required(),
        name: Joi.string().max(255).optional(),
        point: Joi.number().positive().optional(),
        mealId: Joi.number().positive().optional()
    }),
    placeDistance: Joi.object({
        lat: Joi.number().positive().optional(),
        lon: Joi.number().positive().optional()
    }),
    placeAddPromocode: Joi.object({
        code: Joi.string().max(50).required(),
        limit: Joi.number().positive().required(),
        percentage: Joi.number().positive().required()
    }),
}

module.exports = placeSchema