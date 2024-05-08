const baseService = require('../services/base.service')
const placeService = require('../services/place.service')
const Functions = require('../helpers/functions.service')
const Response = require('../helpers/response.service')
const Models = require('../config/models')
const bcrypt = require('bcrypt')

class PlaceController {
    // POST
    async placeRegister(req, res) {
        try {
            const hash = await bcrypt.hash(req.bod.password, 5)
            const slug = await Functions.generateSlug(req.body.name)
            const isExist = { slug: slug, email: req.body.email }
            const body = req.body
            delete body.password
            body.password = hash
            body.slug = slug
            const data = await new baseService(Models.Places).addService(isExist, body)
            const token = await Functions.generateJwt({ id: data.detail.id, email: data.detail.email, role: "place" })
            data.detail.token = token
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async placeLogin(req, res) {
        try {
            const data = await placeService.placeLoginService(req.body)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async placeAddAlbum(req, res) {
        try {
            const data = await placeService.placeAddAlbumService(req.user.id, req.files)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async placeAddCategory(req, res) {
        try {
            const slug = await Functions.generateSlug(req.body.name)
            const body = req.body
            body.slug = slug
            body.placeId = req.user.id
            const data = await new baseService(Models.PlaceCategories).addService(slug, body)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async placeAddSchedule(req, res) {
        try {
            const body = req.body
            body.placeId = req.user.id
            const data = await new baseService(Models.PlaceSchedules).addService(body, body)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async placeAddMeal(req, res) {
        try {
            const slug = await Functions.generateSlug(req.body.name)
            const body = req.body
            body.slug = slug
            body.img = req.file.filename
            const data = await new baseService(Models.Meals).addService(slug, body)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async placeAddMealSize(req, res) {
        try {
            const data = await new baseService(Models.MealSizes).addService(req.body, req.body)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async placeAddMealExtra(req, res) {
        try {
            const data = await new baseService(Models.ExtraMeals).addService(req.body, req.body)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async placeAddAllergen(req, res) {
        try {
            const data = await new baseService(Models.Allergens).addService(req.body, req.body)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async placeAddPunchcard(req, res) {
        try {
            const body = req.body
            body.placeId = req.user.id
            const punchcard = await Models.Punchcards.count({ where: { placeId: req.user.id } })
            if (punchcard >= 3) {
                const result = await Response.Forbidden('Adding more than 3 is not allowed', [])
                return result
            } 
            const data = await new baseService(Models.Punchcards).addService(req.body, req.body)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    // GET
    async fetchPlace(req, res) {
        try {
            const data = await placeService.fetchPlaceService(req.params.slug)
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