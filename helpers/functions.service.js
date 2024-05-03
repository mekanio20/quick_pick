const jwt = require('jsonwebtoken')

class Functions {
    async generateJwt(data, duration) {
        try {
            return jwt.sign(data, process.env.PRIVATE_KEY, { expiresIn: duration || '30d' })
        } catch (error) {
            throw { status: 500, type: 'error', msg: error.message, msg_key: error.name, detail: [] }
        }
    }
    async generateSlug(name) {
        try {
            return name.split(" ").join('-').toLowerCase()
        } catch (error) {
            throw { status: 500, type: 'error', msg: error.message, msg_key: error.name, detail: [] }
        }
    }
}

module.exports = new Functions()