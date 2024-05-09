const baseService = require('../services/base.service')
const Models = require('../config/models')
const bcrypt = require('bcrypt')
const uuid = require('uuid')

class AdminController {
    // PUT
    async editStatus(req, res) {
        try {
            const data = await new baseService(Models.Places).updateService(req.body)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    // DEFAULT
    async Default(req, res) {
        try {
            const admin_pass = await bcrypt.hash('admin', 5)
            const user_pass = await bcrypt.hash('user', 5)
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
                { name: 'Bakery', slug: 'bakery' },
            ]).then(() => { console.log('Categories created') }).catch((err) => { console.log(err) })

            await Models.Users.bulkCreate([
                { email: "quickpick.developer@gmail.com", username: "admin", password: admin_pass, uuid: uuid.v4(), roleId: 1 },
                { email: "mekanbaylyyew@gmail.com", username: "mekan", password: user_pass, uuid: uuid.v4(), roleId: 2 },
            ]).then(() => { console.log('Users created') }).catch((err) => { console.log(err) })

            await Models.Places.bulkCreate([
                { name: 'mekan dukan', slug: 'mekan-dukan', type: 'Cafe', email: 'mrxyok138@gmail.com', password: place_pass, phone_primary: '987654321', address: 'Anew, 27', rating: 4.3, latitude: '283.1231.4122.213', longitude: '24.42.13.213', categoryId: 1, isActive: true },
                { name: 'sumbar dukan', slug: 'sumbar-dukan', type: 'Cafe', email: 'mrxyok139@gmail.com', password: place_pass, phone_primary: '987654322', address: 'Anew, 27', rating: 5.0, latitude: '283.1231.4122.213', longitude: '24.42.13.213', categoryId: 2, isActive: true },
            ]).then(() => { console.log('Places created') }).catch((err) => { console.log(err) })

            await Models.PlaceSchedules.bulkCreate([
                { day: 'Monday', open_time: '11:00', close_time: '20:00', placeId: 1 },
                { day: 'Tuesday', open_time: '10:00', close_time: '20:00', placeId: 1 },
                { day: 'Wednesday', open_time: '10:00', close_time: '20:00', placeId: 1 },
                { day: 'Thursday', open_time: '10:00', close_time: '19:00', placeId: 1 },
                { day: 'Friday', open_time: '10:00', close_time: '19:00', placeId: 1 },
                { day: 'Friday', open_time: '10:00', close_time: '19:00', placeId: 1 },
                { day: 'Saturday', open_time: '10:00', close_time: '19:00', placeId: 1 },
                { day: 'Sunday', open_time: '10:00', close_time: '18:00', placeId: 1 }
            ]).then(() => { console.log('Place Schedules created') }).catch((err) => { console.log(err) })

            await Models.PlaceCategories.bulkCreate([
                { name: 'Meats', slug: 'meats', placeId: 1 },
                { name: 'Meats2', slug: 'meats-2', placeId: 2 },
            ]).then(() => { console.log('PlaceCategories created') }).catch((err) => { console.log(err) })

            await Models.Meals.bulkCreate([
                { name: 'Pepperoni Pizza', slug: 'pepperoni-pizza', img: 'test.jpg', price: 25.15, point: 3, time: '14 min', type: 'Meat', placeCategoryId: 1 },
                { name: 'Pepperoni Pizza 2', slug: 'pepperoni-pizza-2', img: 'test2.jpg', price: 54.15, point: 6, time: '28 min', type: 'Meat', placeCategoryId: 1 }
            ]).then(() => { console.log('Meals created') }).catch((err) => { console.log(err) })

            await Models.Punchcards.bulkCreate([
                { name: 'Free pizza', point: 25, placeId: 1, mealId: 1 },
                { name: 'Free pizza 2', point: 50, placeId: 1, mealId: 2 },
                { name: 'Free pizza 3', point: 75, placeId: 1, mealId: 2 },
                { name: 'Free pizza', point: 25, placeId: 2, mealId: 1 },
                { name: 'Free pizza 2', point: 50, placeId: 2, mealId: 2 },
                { name: 'Free pizza 3', point: 75, placeId: 2, mealId: 2 },
            ]).then(() => { console.log('Punchcards created') }).catch((err) => { console.log(err) })
            
            await Models.PunchCardSteps.bulkCreate([
                { score: 12, placeId: 1, userId: 2 },
                { score: 24, placeId: 2, userId: 2 }
            ]).then(() => { console.log('PunchCardSteps created') }).catch((err) => { console.log(err) })
            
            return res.json({ message: "Completed"})
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
}

module.exports = new AdminController()