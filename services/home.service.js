const Models = require('../config/models')
const Response = require('../helpers/response.service')
const Functions = require('../helpers/functions.service')
const { Op } = require('sequelize')

class HomeService {
    async homeMainService(query) {
        try {
            const whereState = {
                isActive: true,
                price: {
                    [Op.gte]: Number(query.startPrice) || 0,
                    [Op.lte]: Number(query.endPrice) || 10000
                }
            }
            let cats = [1,2,3,4,5,6,7,8,9,10]
            if (query.cat) cats = [Number(query.cat)]
            if (query.type) whereState.type = query.type
            const places = await Models.Places.findAll({
                attributes: [
                    'name', 'slug', 'type', 'rating',
                    'latitude', 'longitude', 'logo', 'copacity'
                ],
                where: { isActive: true, categoryId: cats },
                include: {
                    model: Models.PlaceCategories,
                    where: { isActive: true },
                    attributes: [],
                    include: {
                        model: Models.Meals,
                        where: whereState,
                        attributes: []
                    }
                }
            }).catch((err) => console.log(err))
            if (places.length === 0) { return Response.NotFound('No information found!', []) }
            return Response.Success('Successful!', places)
        } catch (error) {
            throw { status: 500, type: "error", msg: error, detail: [] }
        }
    }
    async homeCategoriesService() {
        try {
            const categories = await Models.Categories.findAndCountAll({
                where: { isActive: true },
                attributes: ['id', 'name', 'slug']
            }).catch((err) => console.log(err))
            if (categories.count === 0) { return Response.NotFound('No information found!', []) }
            return Response.Success('Successful!', categories)
        } catch (error) {
            throw { status: 500, type: "error", msg: error, detail: [] }
        }
    }
    async searchMainService(search) {
        try {
            const result = await Models.Places.findAndCountAll({
                attributes: { exclude: ['password', 'zipcode', 'createdAt', 'updatedAt'] },
                where: { isActive: true, name: { [Op.like]: `%${search}%` } }
            }).catch((err) => console.log(err))
            return Response.Success('Successful!', result)
        } catch (error) {
            throw { status: 500, type: "error", msg: error, detail: [] }
        }
    }
}

module.exports = new HomeService()