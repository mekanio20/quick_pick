const Models = require('../config/models')
const Functions = require('../helpers/functions.service')
const Response = require('../helpers/response.service')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

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
      return Response.Success('Login confirmed', { token })
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async placeAddMealService(body) {
    try {
      const isExist = await Models.Meals.findOne({ where: { slug: body.slug } })
      if (isExist) { return Response.BadRequest('Give another name value!', []) }
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
          await Models.PlaceImages.create({
            id: Number(placeId),
            img: file.filename
          }).catch((err) => console.log(err))
        }
      } else return Response.BadRequest('No file!', [])
      return Response.Created('Created successfully!', [])
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
      let limit = query.limit || 10
      let offset = page * limit - limit
      const meals = await Models.PlaceCategories.findAll({
        attributes: ['id', 'name', 'slug'],
        where: { slug: query.cat, isActive: true },
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
      else result.push({ album: [] })
      
      const schedule = await Models.PlaceSchedules.findAll({
        where: { placeId: place.id },
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      }).catch((err) => console.log(err))

      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      const day = days[new Date().getDay() - 1]
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
  async placeEditMealService(body, img, placeId) {
    try {
      const obj = {}
      if (img) { obj.img = img }
      for (const item in body) if (item && item !== 'id') obj[item] = body[item]
      const meal = await Models.Meals.update(obj,
        { where: { id: body.id, placeId: placeId } })
        .catch((err) => console.log(err))
      if (!meal) { return Response.Forbidden('Not allowed!', []) }
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
      const meal = await Models.Meals.destroy({
        where: { id: id, placeId: placeId }
      }).catch((err) => console.log(err))
      if (!meal) { return Response.Forbidden('Not allowed!', []) }
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