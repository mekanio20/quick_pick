const Models = require('../config/models')
const Response = require('../helpers/response.service')
const { Op } = require('sequelize')

class HomeService {
    async homeMainService(query) {
        try {
            const whereState = {
                categories: [1,2,3,4,5,6,7,8,9,10],
                startPrice: query.startPrice || 0,
                endPrice: query.endPrice || 10000
            }
            if (query.cat) whereState.categories = [Number(query.cat)]
            const places = await Models.Meals.findAll({
                attributes: ['id', 'name', 'price'],
                where: {
                    isActive: true,
                    price: {
                        [Op.gte]: whereState.startPrice,
                        [Op.lte]: whereState.endPrice
                    },
                },
                include: {
                    model: Models.PlaceCategories,
                    attributes: ['id', 'name'],
                    include: {
                        model: Models.Places,
                        attributes: [
                            'id', 'name', 'slug', 'type', 'rating',
                            'latitude', 'longitude', 'logo', 'copacity'
                        ],
                        where: {
                            isActive: true,
                            categoryId: {
                                [Op.in]: whereState.categories
                            }
                        }
                    }
                }
            }).catch((err) => console.log(err))
            if (places[0].place_category === null) { return Response.NotFound('No information found!', []) }
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
}

module.exports = new HomeService()