const Models = require('../config/models')
const Functions = require('../helpers/functions.service')
const Response = require('../helpers/response.service')
const bcrypt = require('bcrypt')

class PlaceService {
  // POST
  async placeLoginService(body) {
    try {
      const place = await Models.Places.findOne({ where: { email: body.email }, attributes: ['id', 'email', 'password'] })
      if (!place) { return Response.NotFound('No information found!', []) }
      const hash = await bcrypt.compare(body.password, place.password)
      if (!hash) { return Response.Forbidden('Password is incorrect!', []) }
      const token = await Functions.generateJwt({ id: place.id, email: place.email, role: "place" })
      return Response.Success('Login confirmed', { token })
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
  async fetchPlaceCateogriesService(slug) {
    try {
      const place_categories = await Models.PlaceCategories.findAll({
        attributes: ['id', 'name', 'slug'],
        where: { isActive: true },
        include: [
          {
            model: Models.Meals,
            attributes: ['id', 'name', 'slug', 'img', 'price', 'point', 'time', 'type'],
            where: { isActive: true }
          },
          {
            model: Models.Places,
            where: { slug: slug, isActive: true },
            attributes: []
          }
        ]
      })
     if (place_categories.length === 0) { return Response.NotFound('No information found!', []) }
     return Response.Success('Successful!', place_categories)
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
}

module.exports = new PlaceService()
