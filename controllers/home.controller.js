const Models = require('../config/models')
const baseService = require('../services/base.service')
const homeService = require('../services/home.service')

class HomeController {
    // GET
    async homeMain(req, res) {
        try {
            const data = await homeService.homeMainService(req.query)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }    
    async homeCategories(req, res) {
        try {
            const data = await homeService.homeCategoriesService()
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async searchMain(req, res) {
        try {
            const data = await homeService.searchMainService(req.query.q)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
}

module.exports = new HomeController()