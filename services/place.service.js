const Models = require('../config/models')
const Functions = require('../helpers/functions.service')
const Response = require('../helpers/response.service')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const stripe = require('stripe')(process.env.STRIPE_SECRET)

class PlaceService {
  // POST
  async placeLoginService(body) {
    try {
      const place = await Models.Places.findOne({ where: { email: body.email } })
      if (!place) { return Response.NotFound('No information found!', []) }
      const hash = await bcrypt.compare(body.password, place.password)
      if (!hash) { return Response.Forbidden('Password is incorrect!', []) }
      place.isActive = true
      await place.save()
      const token = await Functions.generateJwt({ id: place.id, role: "place" })
      return Response.Success('Login confirmed', { name: place.name, logo: place.logo, slug: place.slug, token })
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async placeAddMealService(body, placeId) {
    try {
	console.log(body)
      const isExist = await Models.Meals.findOne({ where: { slug: body.slug } })
      if (isExist) { return Response.BadRequest('Give another name value!', []) }
      const placeCategory = await Models.PlaceCategories.findOne({
        attributes: ['id'],
        where: { id: body.placeCategoryId, placeId: placeId }
      }).catch((err) => console.log(err))
      if (!placeCategory) { return Response.BadRequest('Invalid category!', []) }
      const meal = await Models.Meals.create(body)
        .catch((err) => console.log(err))
      return Response.Created('Created successfully!', meal)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async placeAddAlbumService(placeId, files) {
    try {
      if (files?.photo?.length > 0) {
        for (let file of files.photo) {
          const count = await Models.PlaceImages.count({ where: { placeId: placeId } })
          if (count >= 6) { return Response.BadRequest('Your image limit is up!', []) }
          await Models.PlaceImages.create({
            placeId: Number(placeId),
            img: file.filename
          }).catch((err) => console.log(err))
        }
      } else return Response.BadRequest('No file!', [])
      return Response.Created('Created successfully!', [])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async placeAddPunchcardService(body, placeId) {
    try {
      const meal = await Models.Meals.findOne({
        where: { id: body.mealId, isActive: true },
        attributes: ['placeCategoryId'],
        include: {
          model: Models.PlaceCategories,
          where: { isActive: true },
          attributes: ['placeId'],
          required: true,
          include: {
            model: Models.Places,
            where: { id: placeId, isActive: true },
            required: true,
            attributes: ['name']
          }
        }
      }).catch((err) => console.log(err))
      if (!meal) { return Response.Forbidden('Not allowed', []) }
      body.placeId = placeId
      const [_, created] = await Models.Punchcards.findOrCreate({ where: body, defaults: body })
      if (!created) { return Response.BadRequest('Already exists!', []) }
      return Response.Created('Created successfully!', [])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async placeAddAccountService(placeId) {
    try {
      const placeEmail = await Models.Places.findOne({ where: { id: placeId }, attributes: ['email'] })
      if (!placeEmail) { return Response.BadRequest('Email is not defined!', []) }
      // Account create
      const account = await stripe.accounts.create({
        type: 'custom',
        business_type: 'individual',
        requested_capabilities: ['card_payments', 'transfers']
      })
      const stripe = await Models.StripeAccounts.create({
        stripe: account.id,
        placeId: placeId
      }).catch((err) => console.log(err))
      if (!stripe) { return Response.BadRequest('An unknown error occurred!', []) }
      // Accoutn Link
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        success_url: 'http://localhost:5001/success',
        failure_url: 'http://localhost:5001/failure',
        type: 'custom_account_verification',
        collect: 'eventually_due'
      })
      return Response.Created('Created successfully!', accountLink)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  // GET
  async fetchPlaceCategoriesService(slug) {
    try {
      const place_categories = await Models.PlaceCategories.findAndCountAll({
        attributes: ['id', 'name', 'slug'],
        where: { isActive: true },
        include: {
          model: Models.Places,
          where: { slug: slug, isActive: true },
          attributes: []
        }
      }).catch((err) => console.log(err))
      if (place_categories.count === 0) { return Response.NotFound('No information found!', []) }
      return Response.Success('Successful!', place_categories)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async fetchPlaceMealsService(query) {
    try {
      let page = query.page || 1
      let limit = query.limit || 4
      let offset = page * limit - limit
      let whereState = { isActive: true }
      if (query.cat) whereState.id = query.cat
      const meals = await Models.PlaceCategories.findAll({
        attributes: ['id', 'name', 'slug'],
        where: whereState,
        include: [
          {
            model: Models.Meals,
            attributes: ['id', 'name', 'slug', 'img', 'price', 'point', 'time', 'type'],
            where: { isActive: true },
            limit: Number(limit),
            offset: Number(offset)
          },
          {
            model: Models.Places,
            where: { slug: query.caf, isActive: true },
            attributes: []
          }
        ],
      })
     if (meals.length === 0) { return Response.NotFound('No information found!', []) }
     return Response.Success('Successful!', meals)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async fetchPlaceMealDetailService(slug) {
    try {
      const meal = await Models.Meals.findOne({
        where: { slug: slug, isActive: true },
        attributes: { exclude: ['recomendo', 'placeCategoryId', 'isActive', 'createdAt', 'updatedAt'] }
      }).catch((err) => console.log(err))
      if (!meal) { return Response.NotFound('No information found!', []) }
      return Response.Success('Successful!', meal)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async fetchPlaceRecommendationsService(slug) {
    try {
      const recommendations = await Models.Meals.findAndCountAll({
        where: { isActive: true, recomendo: true },
        attributes: { exclude: ['recomendo', 'placeCategoryId', 'isActive', 'createdAt', 'updatedAt'] },
        include: {
          model: Models.PlaceCategories,
          where: { isActive: true },
          attributes: [],
          include: {
            model: Models.Places,
            where: { slug: slug, isActive: true }
          }
        }
      }).catch((err) => console.log(err))
      if (recommendations.count === 0) { return Response.NotFound('No information found!', []) }
      return Response.Success('Successful!', recommendations)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async fetchPlaceProfileService(placeId) {
    try {
      const place = await Models.Places.findOne({
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
        where: { id: placeId, isActive: true }
      }).catch((err) => console.log(err))
      if (!place) { return Response.Forbidden('Not allowed', []) }
      return Response.Success('Successful!', place)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async fetchPlaceAlbumsService(slug) {
    try {
      const photos = await Models.PlaceImages.findAndCountAll({
        attributes: ['id', 'img'],
        include: {
          model: Models.Places,
          where: { isActive: true, slug: slug },
          attributes: []
        }
      }).catch((err) => console.log(err))
      if (photos.count === 0) { return Response.NotFound('No information found!', []) }
      return Response.Success('Successful!', photos)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async fetchPlaceScheduleService(placeId) {
    try {
      const schedule = await Models.PlaceSchedules.findAndCountAll({
        attributes: { exclude: ['placeId', 'createdAt', 'updatedAt'] },
        include: {
          model: Models.Places,
          where: { id: placeId, isActive: true },
          attributes: []
        }
      }).catch((err) => console.log(err))
      if (schedule.count === 0) { return Response.NotFound('No information found!', []) }
      return Response.Success('Successful!', schedule)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async placeLogoutService(placeId) {
    try {
      await Models.Places.update({ isActive: false }, { where: { id: placeId } })
        .catch((err) => console.log(err))
      const token =  jwt.sign({}, process.env.PRIVATE_KEY, { expiresIn: 0 })
      return Response.Success('Successful!', { token })
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async fetchPlacePunchcardsService(placeId) {
    try {
      const punchcards = await Models.Punchcards.findAndCountAll({
        where: { placeId: placeId, isActive: true },
        attributes: ['id', 'name', 'point', 'mealId']
      }).catch((err) => console.log(err))
      return Response.Success('Successful!', punchcards)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async fetchPlaceService(slug) {
    try {
      let result = []
      const place = await Models.Places.findOne({
        where: { slug: slug, isActive: true },
        attributes: {
          exclude: ['password', 'zipcode', 'reward', 'dine_in', 'tax', 'auto_accept', 'createdAt', 'updatedAt']
        }
      }).catch((err) => console.log(err))
      if (!place) { return Response.NotFound('No information found!', []) }
      result.push({ info: place })

      const images = await Models.PlaceImages.findAndCountAll({
        where: { placeId: place.id },
        attributes: ['id', 'img']
      }).catch((err) => console.log(err))
      if (images.count > 0) result.push({ album: images })
      else result.push({ album: {} })
      
      const schedule = await Models.PlaceSchedules.findAll({
        where: { placeId: place.id },
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      }).catch((err) => console.log(err))

      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const day = days[new Date().getDay()]
      if (schedule.length > 0) {
        result.push({ schedule: schedule })
        for (let item of schedule) {
          if (day === item.day) {
            result.push({ opening_time: [item.open_time, item.close_time] })
          }
        }
      }
      const mesals = await Models.Meals.findAll({
        attributes: ['price'],
        include: {
          model: Models.PlaceCategories,
          attributes: ['placeId'],
          where: { placeId: place.id }
        }
      }).catch((err) => console.log(err))
      
      const prices = await mesals.map((item) => item.price)
      if (prices.length >= 2) result.push({ prices: [Math.min(...prices), Math.max(...prices)] })
      else result.push({ prices: prices[0] })

      return Response.Success('Successful!', result)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  // PUT
  async placeEditAlbumService(id, img, placeId) {
    try {
      if (!img) { return Response.BadRequest('Image required!', []) }
      const album = await Models.PlaceImages.update({ img: img },
        { where: { id: id, placeId: placeId } })
        .catch((err) => console.log(err))
      if (!album) { return Response.Forbidden('Not allowed!', []) }
      return Response.Success('Successfully updated!', [])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async placeEditScheduleService(body, placeId) {
    try {
      const obj = {}
      for (const item in body) if (item && item !== 'id') obj[item] = body[item]
      const schedule = await Models.PlaceSchedules.update(obj,
        { where: { id: body.id, placeId: placeId } })
        .catch((err) => console.log(err))
      if (!schedule) { return Response.Forbidden('Not allowed!', []) }
      return Response.Success('Successfully updated!', [])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async placeEditCategoryService(body, placeId) {
    try {
      const slug = await Functions.generateSlug(body.name)
      const category = await Models.PlaceCategories.findOne({
        where: { id: body.id, placeId: placeId }
      }).catch((err) => console.log(err))
      if (!category) { return Response.Forbidden('Not allowed!', []) }
      category.name = body.name
      category.slug = slug
      await category.save()
      return Response.Success('Successfully updated!', [])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async placeEditMealService(body, placeId) {
    try {
      const obj = {}
      for (const item in body) if (item && item !== 'id') obj[item] = body[item]
      const verif = await Models.Meals.findOne({
        where: { id: body.id },
        include: {
          model: Models.PlaceCategories,
          where: { placeId: placeId },
          required: true
        }
      })
      if (!verif) { return Response.Forbidden('Not allowed!', []) }
      await Models.Meals.update(obj, {
          where: { id: body.id }
      }).then(() => console.log(true))
      .catch((err) => console.log(err))
      return Response.Success('Successfully updated!', [])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async placeEditMealImageService(img, mealId, placeId) {
    try {
      const verif = await Models.Meals.findOne({
        where: { id: mealId },
        include: {
          model: Models.PlaceCategories,
          where: { placeId: placeId },
          required: true
        }
      })
      if (!verif) { return Response.Forbidden('Not allowed!', []) }
      await Models.Meals.update({ img: img }, {
          where: { id: verif.id }
      }).then(() => console.log(true))
      .catch((err) => console.log(err))
      return Response.Success('Successfully updated!', [])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async placeEditPunchcardService(body, placeId) {
    try {
      const obj = {}
      for (const item in body) if (item && item !== 'id') obj[item] = body[item]
      const punchcard = await Models.Punchcards.update(obj,
        { where: { id: body.id, placeId: placeId } })
        .catch((err) => console.log(err))
      if (!punchcard) { return Response.Forbidden('Not allowed!', []) }
      return Response.Success('Successfully updated!', [])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  // DELETE
  async deleteAlbumService(id, placeId) {
    try {
      const photo = await Models.PlaceImages.destroy({
        where: { id: id, placeId: placeId }
      }).catch((err) => console.log(err))
      if (!photo) { return Response.Forbidden('Not allowed!', []) }
      return Response.Success('successfully updated!', [])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async deleteScheduleService(id, placeId) {
    try {
      const schedule = await Models.PlaceSchedules.destroy({
        where: { id: id, placeId: placeId }
      }).catch((err) => console.log(err))
      if (!schedule) { return Response.Forbidden('Not allowed!', []) }
      return Response.Success('Successfully deleted!', [])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async deleteMealService(id, placeId) {
    try {
      const isExist = await Models.Meals.findOne({
        where: { id: id },
        include: {
          model: Models.PlaceCategories,
          where: { placeId: placeId }
        }
      }).catch((err) => console.log(err))
      if (!isExist) { return Response.NotFound('Not found!', []) }
      await Models.Meals.destroy({
        where: { id: isExist.id }
      }).catch((err) => console.log(err))
      return Response.Success('Successfully deleted!', [])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async deletePunchcardService(id, placeId) {
    try {
      const punchcard = await Models.Punchcards.destroy({
        where: { id: id, placeId: placeId }
      }).catch((err) => console.log(err))
      if (!punchcard) { return Response.Forbidden('Not allowed!', []) }
      return Response.Success('Successfully deleted!', [])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
}

module.exports = new PlaceService()
