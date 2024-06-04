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
            const token = await Functions.generateJwt({ id: data.detail.id, role: "place" })
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
            const data = await new baseService(Models.PlaceCategories).addService(body, body)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async placeAddSchedule(req, res) {
        try {
            const body = req.body
            body.placeId = req.user.id
            const isExist = { day: body.day, placeId: body.placeId }
            const data = await new baseService(Models.PlaceSchedules).addService(isExist, body)
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
            body.img = req.file?.filename
            const data = await placeService.placeAddMealService(body, req.user.id)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async placeAddPunchcard(req, res) {
        try {
            const data = await placeService.placeAddPunchcardService(req.body, req.user.id)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async placeAddAccount(req, res) {
        try {
            const data = await placeService.placeAddAccountService(req.params.id)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    // GET
    async fetchPlaceCategories(req, res) {
        try {
            const data = await placeService.fetchPlaceCategoriesService(req.params.slug)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async fetchPlaceMeals(req, res) {
        try {
            const data = await placeService.fetchPlaceMealsService(req.query)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async fetchPlaceMealDetail(req, res) {
        try {
            const data = await placeService.fetchPlaceMealDetailService(req.params.slug)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async fetchPlaceRecommendations(req, res) {
        try {
            const data = await placeService.fetchPlaceRecommendationsService(req.params.slug)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async fetchPlaceProfile(req, res) {
        try {
            const data = await placeService.fetchPlaceProfileService(req.user.id)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async placeLogout(req, res) {
        try {
            const data = await placeService.placeLogoutService(req.user.id)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async fetchPlaceAlbums(req, res) {
        try {
            const data = await placeService.fetchPlaceAlbumsService(req.params.slug)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async fetchPlaceSchedule(req, res) {
        try {
            const data = await placeService.fetchPlaceScheduleService(req.user.id)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async fetchPlacePunchcards(req, res) {
        try {
            const data = await placeService.fetchPlacePunchcardsService(req.user.id)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async fetchPlaceHome(req, res) {
        try {
            const data = await placeService.fetchPlaceHomeService(req.user.id)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async fetchPlaceOrder(req, res) {
        try {
            const data = await placeService.fetchPlaceOrderService(req.user.id, req.query)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async fetchPlaceOrderFinished(req, res) {
        try {
            const data = await placeService.fetchPlaceOrderFinishedService(req.user.id, req.query)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async fetchPlaceOrderHistory(req, res) {
        try {
            const data = await placeService.fetchPlaceOrderHistoryService(req.user.id, req.query)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async fetchPlaceOrderSchedule(req, res) {
        try {
            const data = await placeService.fetchPlaceOrderScheduleService(req.user.id, req.query)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async fetchPlaceSearchItem(req, res) {
        try {
            const data = await placeService.fetchPlaceSearchItemService(req.user.id, req.query.q)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
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
            let newObj = req.body
            newObj.id = req.user.id
            if (req.body?.name) {
                newObj.slug = await Functions.generateSlug(req.body.name)
                const isExist = await Models.Places.findOne({ where: { slug: newObj.slug } })
                if (isExist) {
                    const result = await Response.BadRequest('Enter a different name value!', [])
                    return res.status(result.status).json(result)
                }
            }
            if (req.body?.email) {
                const isExist = await Models.Places.findOne({ where: { email: newObj.email } })
                if (isExist) {
                    const result = await Response.BadRequest('Enter a different email value!', [])
                    return res.status(result.status).json(result)
                }
            }
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
    async placeEditAlbum(req, res) {
        try {
            const data = await placeService.placeEditAlbumService(req.params.id, req.file.filname, req.user.id)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async placeEditSchedule(req, res) {
        try {
            const data = await placeService.placeEditScheduleService(req.body, req.user.id)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async placeEditCategory(req, res) {
        try {
            const data = await placeService.placeEditCategoryService(req.body, req.user.id)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async placeEditMeal(req, res) {
        try {
            const data = await placeService.placeEditMealService(req.body, req.user.id)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async placeEditMealImage(req, res) {
        try {
            const data = await placeService.placeEditMealImageService(req.file.filename, req.params.id, req.user.id)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async placeEditPunchcard(req, res) {
        try {
            const data = await placeService.placeEditPunchcardService(req.body, req.user.id)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async placeEditStatus(req, res) {
        try {
            const data = await placeService.placeEditStatusService(req.params.id, req.user.id)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    // DELETE
    async deleteAlbum(req, res) {
        try {
            const data = await placeService.deleteAlbumService(req.params.id, req.user.id)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async deleteSchedule(req, res) {
        try {
            const data = await placeService.deleteScheduleService(req.params.id, req.user.id)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async deleteMeal(req, res) {
        try {
            const data = await placeService.deleteMealService(req.params.id, req.user.id)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async deletePunchcard(req, res) {
        try {
            const data = await placeService.deletePunchcardService(req.params.id, req.user.id)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async deleteCategory(req, res) {
        try {
            const data = await placeService.deleteCategoryService(req.params.id, req.user.id)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
    async deleteAccount(req, res) {
        try {
            const data = await placeService.deleteAccountService(req.params.id)
            return res.status(data.status).json(data)
        } catch (error) {
            return res.status(500).json({ status: 500, type: 'error', msg: error, detail: [] })
        }
    }
}

module.exports = new PlaceController()