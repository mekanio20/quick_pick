const Response = require('../helpers/response.service')

class BaseService {
    constructor(model) { this.Model = model }
    async addService(isExist, body) {
        try {
            const [data, created] = await this.Model.findOrCreate({ where: isExist, defaults: body })
            if (!created) { return Response.BadRequest('Already exists!', data) }
            return Response.Created('Created successfully!', data)
        } catch (error) {
            throw { status: 500, type: 'error', msg: error, detail: [] }
        }
    }
    async getService(query) {
        try {
            let page = query.page || 1
            let limit = query.limit || 10
            let offset = page * limit - limit
            let sort = query.sort || 'id'
            let order = query.order || 'asc'
            let status = query.status || true
            let whereState = { isActive: status }
            if (status === 'all') { whereState = {} }
            const data = await this.Model.findAndCountAll({
                where: whereState,
                limit: Number(limit),
                offset: Number(offset),
                order: [[sort, order]]
            }).catch((err) => { console.log(err) })
            if (data.count == 0) { return Response.NotFound('No information found!', []) }
            return Response.Success('Successful!', data)
        } catch (error) {
            throw { status: 500, type: 'error', msg: error, detail: [] }
        }
    }
    async updateService(body) {
        try {
            const obj = {}
            for (const item in body) {
                if (item && item !== 'id') {
                    obj[item] = body[item]
                }
            }
            await this.Model.update(obj, { where: { id: Number(body.id) } })
                .catch((err) => { console.log(err) })
            return Response.Success('Successful', [])
        } catch (error) {
            throw { status: 500, type: 'error', msg: error, detail: [] }
        }
    }
    async deleteService(id) {
        try {
            await this.Model.destroy({ where: { id: Number(id) } })
                .then(() => { console.log(true) })
                .catch((err) => { console.log(err) })
            return Response.Success('Successful!', [])
        } catch (error) {
            throw { status: 500, type: 'error', msg: error, detail: [] }
        }
    }
}

module.exports = BaseService