const baseService = require('../services/base.service')
const placeService = require('../services/place.service')

class PlaceController {
    // POST
    async userRegister(req, res) {
        try {
            
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
}

module.exports = new PlaceController()