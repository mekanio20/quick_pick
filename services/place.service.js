require('dotenv').config();
const Models = require('../config/models')
const Functions = require('../helpers/functions.service')
const Response = require('../helpers/response.service')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { Sequelize } = require('../config/database');
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
      const punchcard = await Models.Punchcards.count({
        where: { placeId: placeId }
      }).catch((err) => console.log(err))
      if (punchcard >= 3) { return Response.BadRequest('Your limit is up!', []) }
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
      const placeEmail = await Models.Places.findOne({ where: { id: placeId }, attributes: ['id', 'email'] })
      if (!placeEmail) { return Response.BadRequest('Email is not defined!', []) }
      const stripe_account = await Models.StripeAccounts.findOne({ where: { placeId: placeEmail.id } })
      if (stripe_account) { return Response.BadRequest('Account already exist!', []) }
      // Account create
      const account = await stripe.accounts.create({
        type: 'custom',
        business_type: 'individual',
        requested_capabilities: ['card_payments', 'transfers']
      })
      if (!account) { return Response.BadRequest('An unknown error occurred!', []) }
      // Accoutn Link
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        success_url: 'http://localhost:5001/success',
        failure_url: 'http://localhost:5001/failure',
        type: 'account_onboarding',
        collect: 'eventually_due'
      })
      if (!accountLink) { return Response.BadRequest('An unknown error occurred!', []) }
      await this.placeAddStripeAccount(account.id, placeEmail.id)
      return Response.Created('Created successfully!', accountLink)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async placeAddStripeAccount(accountId, placeId) {
    try {
      const stripe = await Models.StripeAccounts.create({
        stripe: accountId,
        placeId: placeId
      }).catch((err) => console.log(err))
      if (!stripe) { return Response.BadRequest('An unknown error occurred!', []) }
      return Response.Created('Create account!', [])
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
        attributes: { exclude: ['recomendo', 'isActive', 'createdAt', 'updatedAt'] }
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
        attributes: { exclude: ['placeId', 'updatedAt'] },
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
  async fetchPlaceHomeService(placeId) {
    try {
      const order_sum = await Models.Orders.findAll({
        where: { placeId: placeId, payment: true, status: 'Order Collected' },
        attributes: [[Sequelize.fn('SUM', Sequelize.col('sum')), 'totalSum']]
      }).catch((err) => console.log(err))
      const sum = await order_sum[0].dataValues.totalSum
      const orders = await Models.Orders.count({ where: { placeId: placeId, status: 'Order Collected' } })
      let result = null
      let meal = null
      if (orders > 0) {
        result = await Models.OrderItems.findAll({
          attributes: [
            'mealId',
            [Sequelize.fn('COUNT', Sequelize.col('mealId')), 'mealCount']
          ],
          include: {
            model: Models.Orders,
            attributes: [],
            where: { placeId: placeId }
          },
          group: ['mealId'],
          order: [[Sequelize.fn('COUNT', Sequelize.col('mealId')), 'DESC']],
          limit: 1
        }).catch((err) => console.log(err))
  
        meal = await Models.Meals.findOne({
          where: { id: result[0].mealId },
          attributes: ['id', 'name', 'slug']
        }).catch((err) => console.log(err))
      }
      return Response.Success('Successful!', {sum: sum, orders, meal})
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async fetchPlaceOrderService(placeId, query) {
    try {
      let page = query.page || 1
      let limit = query.limit || 10
      let offset = page * limit - limit
      const orders = await Models.Orders.findAndCountAll({
        where: { placeId: placeId, status: { [Op.ne]: 'Order Collected' } },
        attributes: { exclude: ['placeId', 'updatedAt'] },
        include: {
          model: Models.OrderItems,
          attributes: { exclude: ['orderId', 'mealId', 'createdAt', 'updatedAt'] },
          include: {
            model: Models.Meals,
            attributes: ['id', 'name', 'slug', 'price']
          }
        },
        limit: Number(limit),
        offset: Number(offset)
      }).catch((err) => console.log(err))
      if (orders.count === 0) { return Response.BadRequest('Orders not found!', []) }
      orders.rows.forEach((item) => {
        if (item.createdAt) {
          const date = new Date(item.createdAt)
          date.setTime(date.getTime() + Number(item.time) * 60 * 1000)
          item.dataValues.times = {
            start_time: item.createdAt,
            end_time: date
          }
        }
      })
      return Response.Success('Successful!', orders)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async fetchPlaceOrderFinishedService(placeId, query) {
    try {
      let page = query.page || 1
      let limit = query.limit || 4
      let offset = page * limit - limit
      const date = new Date()
      const start_date = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const end_date = new Date(start_date.getTime() + 86400000)
      const orders = await Models.Orders.findAll({
        where: { placeId: placeId, status: 'Order Collected', createdAt: { [Op.between]: [start_date, end_date] } },
        attributes: { exclude: ['placeId', 'updatedAt'] },
        include: {
          model: Models.OrderItems,
          attributes: { exclude: ['orderId', 'mealId', 'createdAt', 'updatedAt'] },
          include: {
            model: Models.Meals,
            attributes: ['id', 'name', 'slug', 'price']
          }
        },
        limit: Number(limit),
        offset: Number(offset)
      }).catch((err) => console.log(err))
      const order = { count: orders.length, rows: orders }
      if (order.count === 0) { return Response.BadRequest('Order finished not found!', []) }
      return Response.Success('Successful!', order)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async fetchPlaceOrderHistoryService(placeId, query) {
    try {
      let page = query.page || 1
      let limit = query.limit || 10
      let offset = page * limit - limit
      const order_history = await Models.Orders.findAll({
        where: { placeId: placeId, status: 'Order Collected' },
        attributes: { exclude: ['placeId', 'updatedAt'] },
        include: {
          model: Models.OrderItems,
          attributes: { exclude: ['orderId', 'mealId', 'createdAt', 'updatedAt'] },
          include: {
            model: Models.Meals,
            attributes: ['id', 'name', 'slug', 'price']
          }
        },
        limit: Number(limit),
        offset: Number(offset)
      }).catch((err) => console.log(err))
      const history = { count: order_history.length, rows: order_history }
      if (history.count === 0) { return Response.BadRequest('Order history not found!', []) }
      return Response.Success('Successful!', history)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async fetchPlaceOrderScheduleService(placeId, query) {
    try {
      let page = query.page || 1
      let limit = query.limit || 4
      let offset = page * limit - limit
      const order_schedule = await Models.Orders.findAndCountAll({
        where: { placeId: placeId, schedule: { [Op.ne]: null } },
        attributes: { exclude: ['placeId', 'updatedAt'] },
        include: {
          model: Models.OrderItems,
          attributes: { exclude: ['orderId', 'createdAt', 'updatedAt'] }
        },
        limit: Number(limit),
        offset: Number(offset)
      }).catch((err) => console.log(err))
      if (order_schedule.count === 0) { return Response.BadRequest('Order schedule not found!', []) }
      return Response.Success('Successful!', order_schedule)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async fetchPlaceSearchItemService(placeId, search) {
    try {
      const meals = await Models.PlaceCategories.findAndCountAll({
        attributes: ['id', 'name', 'slug'],
        where: { isActive: true, placeId: placeId },
        include: [
          {
            model: Models.Meals,
            where: { isActive: true, name: { [Op.like]: `%${search}%` } },
            attributes: ['id', 'name', 'slug', 'img', 'price', 'point', 'time', 'type'],
          }
        ]
      }).catch((err) => console.log(err))
      return Response.Success('Successful!', meals)
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
        attributes: ['price', 'time'],
        include: {
          model: Models.PlaceCategories,
          attributes: ['placeId'],
          where: { placeId: place.id }
        }
      }).catch((err) => console.log(err))
      
      const time = await mesals.map((item) => item.time)
      if (time.length >= 2) result.push({ times: [Math.min(...time), Math.max(...time)] })
      else if (item.length === 1) result.push({ times: [0, Math.max(...prices)] })
      else result.push({ times: [0, 0] })

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
  async placeEditStatusService(id, placeId) {
    try {
      let order_status = null
      const order = await Models.Orders.findOne({ where: { id: id, placeId: placeId } })
      if (!order) { return Response.Forbidden('Not allowed!', []) }
      switch (order.status) {
        case "Order Placed":
          order_status = "Preparation Started"
          break;
        case "Preparation Started":
          order_status = "Ready in 5 Minutes"
          break;
        case "Ready in 5 Minutes":
          order_status = "Order Finished"
          break;
        case "Order Finished":
          order_status = "Order Collected"
          break;
        default:
          order_status = "Order Collected"
          break;
      }
      order.status = order_status
      await order.save()
      return Response.Success('Successfully updated!', { status: order.status } )
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
  async deleteCategoryService(id, placeId) {
    try {
      const category = await Models.PlaceCategories.destroy({
        where: { id: id, placeId: placeId }
      }).catch((err) => console.log(err))
      if (!category) { return Response.Forbidden('Not allowed!', []) }
      return Response.Success('Successfully deleted!', [])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async deleteAccountService(id) {
    try {
      const deletedAccount = await stripe.accounts.del(id)
      return Response.Success('Deleted!', deletedAccount)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
}

module.exports = new PlaceService()