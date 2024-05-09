const Models = require('../config/models')

class VerificationService {
    async isExists(email, status) {
        try {
            let whereState = { email: email }
            if (status == true) { whereState = { email: email, isActive: true } }
            return Models.Users.findOne({
                attributes: ['id', 'email', 'phone', 'username', 'img', 'fullname', 'birthday'],
                where: whereState,
            })
        } catch (error) {
            throw { status: 500, type: 'error', msg: error.message, msg_key: error.name, detail: [] }
        }
    }
}

module.exports = new VerificationService()