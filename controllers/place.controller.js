const baseService = require('../services/base.service')
const placeService = require('../services/place.service')
const Functions = require('../helpers/functions.service')
const Models = require('../config/models')

class PlaceController {
    // POST
    async placeRegister(req, res) {
        try {
            const slug = await Functions.generateSlug(req.body.name)
            const isExist = { slug: slug, email: req.body.email }
            const body = req.body
            body.slug = slug
            body.logo = req.file.filename
            const data = await new baseService(Models.Places).addService(isExist, body)
            const token = await Functions.generateJwt({ id: data.detail.id, email: data.detail.email })
            data.detail.token = token
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    // PUT
    async placeEdit(req, res) {
        try {
            let newObj = { id: req.user.id }
            const place = await Models.Places.findOne({ where: { id: req.user.id, isActive: true }, attributes: ['id'] })
            if (!place) { return Response.NotFound('No information found!', []) }
            if (req.files?.logo) { newObj.logo = req.files.logo[0].filename }
            if (req.files?.banner) { newObj.banner = req.files.banner[0].filename }
            if (req.files?.reward) { newObj.reward = req.files.reward[0].filename }
            const data = await new baseService(Models.Places).updateService(newObj)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
}

module.exports = new PlaceController()