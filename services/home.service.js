const Models = require('../config/models')
const Response = require('../helpers/response.service')

class HomeService {
    async homeMainService(query) {
        try {
            const places = await Models.Places.findAndCountAll({
                where: { isActive: true },
                attributes: [
                    'id', 'name', 'slug', 'type', 'rating',
                    'latitude', 'longitude', 'logo', 'copacity'
                ]
            }).catch((err) => console.log(err))
            if (places.count === 0) { return Response.NotFound('No information found!', []) }
            return Response.Success('Successful!', places)
        } catch (error) {
            throw { status: 500, type: "error", msg: error, detail: [] }
        }
    }
}

module.exports = new HomeService()