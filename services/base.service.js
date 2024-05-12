const Response = require('../helpers/response.service')

class BaseService {
    constructor(model) { this.Model = model }
    async addService(isExist, body) {
        try {
            const [data, created] = await this.Model.findOrCreate({ where: isExist, defaults: body })
                .catch((err) => console.log(err))
            if (!created) { return Response.BadRequest('Already exists!', []) }
            return Response.Created('Created successfully!', data)
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
            return Response.Success('Successful!', [])
        } catch (error) {
            throw { status: 500, type: 'error', msg: error, detail: [] }
        }
    }
}

module.exports = BaseService