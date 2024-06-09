const baseService = require('../services/base.service')
const Models = require('../config/models')
const bcrypt = require('bcrypt')
const uuid = require('uuid')

class AdminController {
    // POST
    async addCategory(req, res) {
        try {
            const data = await new baseService(Models.Categories).addService(req.body)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    // PUT
    async editStatus(req, res) {
        try {
            const data = await new baseService(Models.Places).updateService(req.body)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    // DELETE
    async deleteCategory(req, res) {
        try {
            const data = await new baseService(Models.Categories).deleteService(req.params.id)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    // DEFAULT
    async Default(req, res) {
        try {
            const place_pass = await bcrypt.hash('seller', 5)

            await Models.Roles.bulkCreate([
                { name: 'admin' },
                { name: 'user' }
            ]).then(() => { console.log('Roles created') }).catch((err) => { console.log(err) })

            await Models.Categories.bulkCreate([
                { name: 'Burger', slug: 'burger' },
                { name: 'Breakfast', slug: 'breakfast' },
                { name: 'Street food', slug: 'street-food' },
                { name: 'Pizza', slug: 'pizza' },
                { name: 'Soup', slug: 'soup' },
                { name: 'Chicken', slug: 'chicken' },
                { name: 'Salad', slug: 'salad' },
                { name: 'Italian', slug: 'italian' },
                { name: 'Falafel', slug: 'falafel' },
                { name: 'Bakery', slug: 'bakery' }
            ]).then(() => { console.log('Categories created') }).catch((err) => { console.log(err) })

            await Models.Users.bulkCreate([
                { email: "quickpick.developer@gmail.com", username: "admin", uuid: uuid.v4(), roleId: 1 },
                { email: "mekanbaylyyew5@gmail.com", username: "mekan", fullname: "mekan baylyyew", uuid: uuid.v4(), roleId: 2 },
                { email: "sumbar.babayew.2003@gmail.com", username: "sumbar", fullname: "sumbar babayew", uuid: uuid.v4(), roleId: 2 },
            ]).then(() => { console.log('Users created') }).catch((err) => { console.log(err) })

            await Models.Places.bulkCreate([
                { name: 'mekan dukan', slug: 'mekan-dukan', type: 'Cafe', email: 'mrxyok138@gmail.com', password: place_pass, phone_primary: '987654321', address: 'Anew, 27', rating: 4.3, latitude: 47.56670524318587, longitude: 14.24390891117955, color: '#FFE0B0', categoryId: 1, isActive: true },
                { name: 'sumbar dukan', slug: 'sumbar-dukan', type: 'Cafe', email: 'mrxyok139@gmail.com', password: place_pass, phone_primary: '987654322', address: 'Anew, 27', rating: 5.0, latitude: 47.567424, longitude: 14.243638, color: '#E0FBFC', categoryId: 2, isActive: true },
            ]).then(() => { console.log('Places created') }).catch((err) => { console.log(err) })

            await Models.PlaceSchedules.bulkCreate([
                { day: 'Monday', open_time: '11:00', close_time: '20:00', placeId: 1 },
                { day: 'Tuesday', open_time: '10:00', close_time: '20:00', placeId: 1 },
                { day: 'Wednesday', open_time: '10:00', close_time: '20:00', placeId: 1 },
                { day: 'Thursday', open_time: '10:00', close_time: '19:00', placeId: 1 },
                { day: 'Friday', open_time: '10:00', close_time: '19:00', placeId: 1 },
                { day: 'Friday', open_time: '10:00', close_time: '19:00', placeId: 1 },
                { day: 'Saturday', open_time: '10:00', close_time: '19:00', placeId: 1 },
                { day: 'Sunday', open_time: '10:00', close_time: '18:00', placeId: 1 },
                { day: 'Monday', open_time: '11:00', close_time: '20:00', placeId: 2 },
                { day: 'Tuesday', open_time: '10:00', close_time: '20:00', placeId: 2 },
                { day: 'Wednesday', open_time: '10:00', close_time: '20:00', placeId: 2 },
                { day: 'Thursday', open_time: '10:00', close_time: '19:00', placeId: 2 },
                { day: 'Friday', open_time: '10:00', close_time: '19:00', placeId: 2 },
                { day: 'Saturday', open_time: '10:00', close_time: '19:00', placeId: 2 },
                { day: 'Sunday', open_time: '10:00', close_time: '18:00', placeId: 2 }
            ]).then(() => { console.log('Place Schedules created') }).catch((err) => { console.log(err) })

            await Models.PlaceCategories.bulkCreate([
                { name: 'Meats', slug: 'meats', placeId: 1 },
                { name: 'Soups', slug: 'soups', placeId: 1 },
                { name: 'Desert', slug: 'desert', placeId: 1 },
                { name: 'Meats', slug: 'meats', placeId: 2 },
                { name: 'Soups', slug: 'soups', placeId: 2 },
            ]).then(() => { console.log('PlaceCategories created') }).catch((err) => { console.log(err) })

            await Models.Meals.bulkCreate([
                { name: 'Pepperoni Pizza', ingredients: 'Tomato Sauce, Parmesan cheese, Dried oregano, Mozzarella cheese, Pepperoni', slug: 'pepperoni-pizza', img: 'test.jpg', price: 25.15, point: 3, time: 14, type: 'Meat', extra_meals: [{ name: "sosis", price: 0.25, allergens: ["milk", "sugar"] }], meal_sizes: [{ size: "Small", price: 0.30 }, { size: "Medium", price: 0.50 }], allergens: [{ name: "milk" }], placeCategoryId: 1 },
                { name: 'Pepperoni Pizza 2', ingredients: 'Tomato Sauce, Parmesan cheese, Dried oregano, Mozzarella cheese, Pepperoni', slug: 'pepperoni-pizza-2', img: 'test.jpg', price: 54.15, point: 6, time: 28, type: 'Meat', extra_meals: [{ name: "sosis", price: 0.25, allergens: ["milk"] }], meal_sizes: [{ size: "Small", price: 0.30 }, { size: "Medium", price: 0.50 }], placeCategoryId: 2 },
                { name: 'Pepperoni Pizza 3', ingredients: 'Tomato Sauce, Parmesan cheese, Dried oregano, Mozzarella cheese, Pepperoni', slug: 'pepperoni-pizza-3', img: 'test.jpg', price: 23.15, point: 6, time: 13, type: 'Meat', extra_meals: [{ name: "sosis", price: 0.25 }], meal_sizes: [{ size: "Small", price: 0.30 }, { size: "Medium", price: 0.50 }], placeCategoryId: 1 },
                { name: 'Soups', ingredients: 'Tomato Sauce, Parmesan cheese, Dried oregano, Mozzarella cheese, Pepperoni', slug: 'soups', img: 'test.jpg', price: 23.15, point: 6, time: 14, type: 'Halal', meal_sizes: [{ size: "Small", price: 0.30 }], placeCategoryId: 2 },
                { name: 'Soups-1', ingredients: 'Tomato Sauce, Parmesan cheese, Dried oregano, Mozzarella cheese, Pepperoni', slug: 'soups-1', img: 'test.jpg', price: 23.15, point: 6, time: 23, type: 'Halal', meal_sizes: [{ size: "Small", price: 0.30 }], placeCategoryId: 5 },
                { name: 'Pizza-1', ingredients: 'Tomato Sauce, Parmesan cheese, Dried oregano, Mozzarella cheese, Pepperoni', slug: 'pizza-1', img: 'test.jpg', price: 23.15, point: 6, time: 25, type: 'Halal', meal_sizes: [{ size: "Small", price: 0.30 }], placeCategoryId: 4 },
            ]).then(() => { console.log('Meals created') }).catch((err) => { console.log(err) })

            await Models.Punchcards.bulkCreate([
                { name: 'Free pizza', point: 25, placeId: 1, mealId: 1 },
                { name: 'Free pizza 2', point: 50, placeId: 1, mealId: 2 },
                { name: 'Free pizza 3', point: 75, placeId: 1, mealId: 2 },
                { name: 'Free pizza', point: 25, placeId: 2, mealId: 5 },
                { name: 'Free pizza 2', point: 50, placeId: 2, mealId: 5 },
                { name: 'Free pizza 3', point: 75, placeId: 2, mealId: 6 },
            ]).then(() => { console.log('Punchcards created') }).catch((err) => { console.log(err) })

            await Models.PunchCardSteps.bulkCreate([
                { score: 26, placeId: 1, userId: 2 },
                { score: 50, placeId: 2, userId: 2 },
                { score: 50, placeId: 1, userId: 3 },
                { score: 75, placeId: 2, userId: 3 },
            ]).then(() => { console.log('PunchCardSteps created') }).catch((err) => { console.log(err) })

            await Models.Baskets.bulkCreate([
                { count: 2, extra_meals: [{ name: "sosis", price: 0.25, allergens: ["milk", "sugar"] }], meal_sizes: [{ size: "Small", price: 0.30 }], mealId: 1, userId: 2 },
                { count: 3, extra_meals: [{ name: "sosis", price: 0.25, allergens: ["milk"] }], meal_sizes: [{ size: "Small", price: 0.30 }], mealId: 2, userId: 2 },
            ]).then(() => { console.log('Baskets created') }).catch((err) => { console.log(err) })
            
            return res.json({ message: "Completed"})
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
}

module.exports = new AdminController()