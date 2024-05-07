const baseService = require('../services/base.service')
const userService = require('../services/user.service')

class UserController {
    // POST
    async userRegister(req, res) {
        try {
            let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
            ip = ip.substr(7)
            let os = null
            const info = req.get('User-Agent')
            const operation_systems = ['Android', 'iPhone', 'Mac OS', 'Windows']
            for (let i = 0; i < operation_systems.length; i++) {
                if (info.includes(operation_systems[i])) {
                    os = operation_systems[i]
                    break
                }
            }
            const data = await userService.userRegisterService(req.body, ip, os)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async userVerification(req, res) {
        try {
            const data = await userService.userVerificationService(req.body.code, req.userDto)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async userLogin(req, res) {
        try {
            const data = await userService.userLoginService(req.body)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    // GET
    async userProfile(req, res) {
        try {
            const data = await userService.userProfileService(req.user)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async fetchPlace(req, res) {
        try {
            const data = await userService.fetchPlaceService(req.params.slug)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async fetchPunchcard(req, res) {
        try {
            const data = await userService.fetchPunchcardService(req.params.slug, req.user.id)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async fetchAllPunchcards(req, res) {
        try {
            const data = await userService.fetchAllPunchcardsService(req.user.id)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
}

module.exports = new UserController()