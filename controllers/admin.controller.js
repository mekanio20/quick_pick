const Models = require('../config/models')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const baseService = require('../services/base.service')

class AdminController {
    // POST
    async Default(req, res) {
        try {
            const hash = await bcrypt.hash('admin', 5)

            await Models.Roles.bulkCreate([
                { name: 'admin' },
                { name: 'user' }
            ]).then(() => { console.log('Roles created') }).catch((err) => { console.log(err) })

            await Models.Users.bulkCreate([
                { email: "quickpick.developer@gmail.com", phone: "123456", username: "admin", password: hash, firstname: "test", lastname: "test", uuid: uuid.v4(), roleId: 1 }
            ]).then(() => { console.log('Users created') }).catch((err) => { console.log(err) })
            
            return res.json({ message: "Completed"})
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
}

module.exports = new AdminController()