const Verification = require('../helpers/verification.service')
const Functions = require('../helpers/functions.service')
const Response = require('../helpers/response.service')
const nodemailer = require('nodemailer')
const uuid = require('uuid')
const redis = require('../ioredis')
const { Op, or } = require('sequelize')
const Models = require('../config/models')
const { Sequelize } = require('../config/database')
const stripe = require('stripe')(process.env.STRIPE_SECRET)

class UserService {
  // POST
  async userRegisterService(body, ip, os) {
    try {
      const user = await Verification.isExists(body.email, true)
      if (user) { return Response.BadRequest("User already exists!", []) }
      const code = (100000 + Math.floor(Math.random() * 100000)).toString()
      await redis.set(body.email, code)
      await redis.expire(body.email, 300)
      let customer = {
        email: body.email,
        username: body.username || null,
        fullname: body.fullname || null,
        phone: body.phone || null,
        ip: ip,
        os: os,
        uuid: uuid.v4(),
        roleId: 2
      }
      console.log(customer, code)
      const token = await Functions.generateJwt(customer, '3m')
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD
        }
      })
      let mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: customer.email,
        subject: 'QuicikPick Verification',
        html: `<h1>Your verification code: </h1> <h2>${code}</h2>`
      }
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) console.log('An error occurred while sending the email: ', error)
        else { console.log('Email sent successfully: ', info.response) }
      })
      return Response.Success('Email sent successfully!', [{ token }])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async userVerificationService(code, user) {
    try {
      const systemcode = await redis.get(user.email)
      if (String(code) !== systemcode) { return Response.BadRequest('The verification code is invalid', []) }
      console.log(systemcode)
      const customer = await Models.Users.create(user)
        .catch((err) => { console.log(err) })
      console.log(JSON.stringify(customer, null, 2))
      if (!customer) { return Response.BadRequest('An unknown error occurred!', []) }
      const token = await Functions.generateJwt({ id: customer.id, role: "user" })
        .catch((err) => { console.log(err) })
      return Response.Created('User is registered!', [{ token }])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async userLoginService(body) {
    try {
      const user = await Models.Users.findOne({ where: { email: body.email } })
      if (!user) { return Response.NotFound('User not found!', []) }
      const code = (100000 + Math.floor(Math.random() * 100000)).toString()
      await redis.set(user.email, code)
      await redis.expire(user.email, 300)
      console.log(JSON.stringify(user, null, 2))
      const otp_token = await Functions.generateJwt({email: user.email}, '3m')
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD
        }
      })
      let mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: user.email,
        subject: 'QuicikPick Verification',
        html: `<h1>Your verification code: </h1> <h2>${code}</h2>`
      }
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) console.log('An error occurred while sending the email: ', error)
        else { console.log('Email sent successfully: ', info.response) }
      })
      return Response.Success('Email sent successfully!', [{ token: otp_token }])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async userCheckService(code, user) {
    try {
      const systemcode = await redis.get(user.email)
      if (String(code) !== systemcode) { return Response.BadRequest('The verification code is invalid', []) }
      const customer = await Models.Users.findOne({ where: { email: user.email } })
      if (!customer) { return Response.BadRequest('An unknown error occurred!', []) }
      customer.isActive = true
      await customer.save()
      console.log(JSON.stringify(customer, null, 2))
      const token = await Functions.generateJwt({ id: customer.id, role: "user" })
        .catch((err) => { console.log(err) })
      return Response.Success('User logged in!', [{ token }])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async userAddBasketService(body, userId) {
    try {
      const basket = await Models.Baskets.findAll({
        where: { userId: userId, isActive: true },
        include: {
          model: Models.Meals,
          attributes: ['placeCategoryId'],
          include: {
            model: Models.PlaceCategories,
            attributes: ['placeId']
          }
        }
      }).catch((err) => console.log(err))
      const meal = await Models.Meals.findOne({
        where: { id: body.mealId, isActive: true },
        attributes: ['id', 'name', 'point', 'extra_meals', 'meal_sizes'],
          include: {
            model: Models.PlaceCategories,
            where: { isActive: true },
            attributes: ['placeId'],
            required: true,
            include: {
              model: Models.Places, 
              attributes: ['slug'],
              required: true
            }
        }
      }).catch((err) => console.log(err))
      if (!meal) { return Response.BadRequest('Meal not found!', []) }
      if (body?.extra_meals?.length > 0) {
        let found = await body.extra_meals.every(bItem => {
          return meal?.extra_meals?.some(aItem => {
            return aItem.name === bItem.name && aItem.price === bItem.price
          })
        })
        if (found == false) { return Response.BadRequest('There is no such extra meal', []) }
      }
      if (body?.meal_sizes?.length > 0) {
        let found = await body.meal_sizes.every(bItem => {
          return meal?.meal_sizes?.some(aItem => {
              return aItem.size === bItem.size && aItem.price === bItem.price
          })
        })
        if (found == false) { return Response.BadRequest('There is no such meal size', []) }
      }
      if (basket.length > 0) {
        let _place = meal?.place_category?.placeId
        let _bool = await basket.some(item => item?.meal?.place_category?.placeId === _place)
        if (!_bool) return Response.BadRequest('Please empty your cart first!', [])
      }
      let _extra_meals = JSON.stringify(body?.extra_meals) || null
      let _meal_sizes = JSON.stringify(body?.meal_sizes) || null
      let len = await basket.length
      let temp_e_meal = null
      let temp_s_meal = null
      let count = 0
      let point = 0
      for (let i = 0; i < len; i++) {
        temp_e_meal = await basket[i].extra_meals ? JSON.stringify(basket[i].extra_meals) : null
        temp_s_meal = await basket[i].meal_sizes ? JSON.stringify(basket[i].meal_sizes) : null
        console.log(typeof _meal_sizes, typeof temp_s_meal)
        console.log('Extra meals --> ', _extra_meals === temp_e_meal)
        console.log('Meal sizes --> ', _meal_sizes === temp_s_meal)
        if (basket[i].mealId == body.mealId &&
            temp_e_meal == _extra_meals &&
            temp_s_meal == _meal_sizes) {
              count = await basket[i].count + body?.count || 1
              point = await meal.point * count
              await Models.Baskets.update({ count: count, score: point }, { where: { id: basket[i].id } })
                .catch((err) => console.log(err))
              return Response.Success('Update successfully!', [])
        }
      }
      body.userId = userId
      body.score = await meal.point * body?.count || 1
      const basket_create = await Models.Baskets.create(body)
      if (!basket_create) { return Response.BadRequest('Error occurred!', []) }
      return Response.Created('Created successfully!', [])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async userAddPaymentService(body, userId) {
    try {
      const baskets = await Models.Baskets.findAll({
        where: { isActive: true, userId: userId },
        attributes: { exclude: ['userId', 'mealId', 'createdAt', 'updatedAt'] },
        include: {
          model: Models.Meals,
          where: { isActive: true },
          attributes: { exclude: ['isActive', 'recomendo', 'placeCategoryId', 'allergens', 'createdAt', 'updatedAt'] },
          required: true,
          include: {
            model: Models.PlaceCategories,
            attributes: ['placeId'],
            required: true
          }
        }
     }).catch((err) => console.log(err))
     if (baskets.length == 0) return Response.BadRequest('There are no items in your cart!', [])
     const placeId = await baskets[0].meal.place_category.placeId

     const isOpen = await Models.Places.findOne({ where: { id: placeId }, attributes: ['dine_in', 'open_close'] })
     if (isOpen.open_close == false) { return Response.BadRequest('Vendor location is closed!', []) }
     if (isOpen.dine_in == false) { return Response.BadRequest('Your need to pick up!', []) }

     const orders = await Models.Orders.count({
      where: {
        userId: userId,
        status: {
          [Op.or]: ['Order Placed', 'Preparation Started', 'Ready in 5 Minutes', 'Order Finished']
        }
      }
     }).catch((err) => console.log(err))
     if (orders > 0) { return Response.BadRequest('Please wait for your order to be completed!', []) }

     let sum = 0
     let score = 0
     let time = 0
     let order_info = []
     baskets.forEach(async (item) => {
      score += item.score
      let totalPrice = 0
      let totalSizePrice = 0
      let totalExtraPrice = 0
      if (time < item.meal.time) time = item.meal.time
      if (item.meal_sizes) totalSizePrice = item.meal_sizes.reduce((acc, meal) => acc + meal.price, 0)
      if (item.extra_meals) totalExtraPrice = item.extra_meals.reduce((acc, meal) => acc + meal.price, 0)
      if (item.meal.price) {
        totalPrice = (totalExtraPrice + totalSizePrice + Number(item.meal.price) + Number(item.meal.tax))
        sum += Number(totalPrice.toFixed(2)) * Number(item.count)
        order_info.push({
          quantity: item.count,
          total_price: Number(totalPrice.toFixed(2)),
          extra_meals: item.extra_meals,
          meal_sizes: item.meal_sizes,
          mealId: item.meal.id,
        })
      }
    })
    // sum = Number(sum.toFixed(2)) + Number(body.tip) || 0
    const stripe_account = await Models.StripeAccounts.findOne({
      where: { placeId: placeId }
    }).catch((err) => console.log(err))
    if (!stripe_account) { return Response.BadRequest('Payment account not found!', []) }

    const names = baskets.map((item) => item.meal.name).toString()
    const charge = await stripe.charges.create({
      amount: Math.round(sum * 100),
      currency: 'eur',
      source: body.token,
      description: names,
      destination: stripe_account.stripe
    })

    if (charge?.status !== "succeeded") { return Response.BadRequest('Payment not made!', []) }
    const order = await Models.Orders.create({
      type: body.type,
      tip: body.tip || 0,
      sum: Number(sum.toFixed(2)),
      note: body.note || null, 
      payment: true,
      schedule: body.schedule || null,
      time: time,
      placeId: placeId,
      userId: userId
    }).catch((err) => console.log(err))

    order_info.forEach(async (item) => {
      item.orderId = await order.id
      await Models.OrderItems.create(item)
        .then(() => console.log(true))
        .catch((err) => console.log(err))
    })

    await Models.PunchCardSteps.create({
      score: score,
      userId: userId,
      placeId: placeId
    }).then(() => console.log('punchcard added...'))
    .catch((err) => console.log(err))
    
    for (const item of baskets) {
      item.isActive = false
      await item.save()
    }

    return Response.Success('Successfull!', [order])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  // PUT
  async userUpdateProfileService(body, img, userId) {
    try {
      const obj = {}
      if (img?.filename) obj.img = img.filename
      if (body?.email) {
        const isExist = await Models.Users.findOne({ where: { email: body.email } })
        if (isExist) return Response.BadRequest('The user for this email already exists!', [])
        obj.email = body.email
      }
      for (const item in body) {
        if (item && item !== 'email')
          obj[item] = body[item]
      }
      const user = await Models.Users.update(obj, { where: { id: userId } })
        .catch((err) => console.log(err))
      if (!user) { return Response.Forbidden('Not allowed!', []) }
      return Response.Success('Successfully updated!', [])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async userUpdateBasketService(body, userId) {
    try {
      const basket = await Models.Baskets.findOne({
        where: { id: body.id, userId: userId, isActive: true },
        include: {
          model: Models.Meals,
          attributes: ['name', 'point', 'extra_meals', 'meal_sizes'],
          required: true,
          include: {
            model: Models.PlaceCategories,
            attributes: ['placeId'],
            required: true,
            include: {
              model: Models.Places,
              attributes: ['name'],
              required: true
            }
          }
        }
      }).catch((err) => console.log(err))
      if (basket.length === 0) { return Response.BadRequest('Meal not found!', []) }

      const meal = await basket.meal
   
     if (body?.extra_meals?.length > 0) {
      let found = await body.extra_meals.every(bItem => {
        return meal?.extra_meals?.some(aItem => {
          return aItem.name === bItem.name && aItem.price === bItem.price
        })
      })
        if (found == false) { return Response.BadRequest('There is no such extra meal', []) }
      }
      if (body?.meal_sizes?.length > 0) {
        let found = await body.meal_sizes.every(bItem => {
          return meal?.meal_sizes?.some(aItem => {
            return aItem.size === bItem.size && aItem.price === bItem.price
        })
      })
        if (found == false) { return Response.BadRequest('There is no such meal size', []) }
      }
   
    const obj = {}
    for (const item in body) if (item) obj[item] = body[item]
    await Models.Baskets.update(obj, { where: { id: basket.id } })
      .catch((err) => console.log(err))
    
    return Response.Success('Successfully updated!', [])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  // GET
  async userProfileService(user) {
    try {
      const customer = await Models.Users.findOne({
        where: { id: user.id, isActive: true },
        attributes: { exclude: ['ip', 'os', 'uuid', 'roleId', 'isActive', 'createdAt', 'updatedAt'] }
      }).catch((err) => { console.log(err) })
      if (!customer) { return Response.Unauthorized('User not found!', []) }
      return Response.Success('Successful!', [customer])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async fetchAllPunchcardsService(userId) {
    try {
      const punchcard_steps = await Models.PunchCardSteps.findAll({
        where: { userId: userId, isActive: true },
        attributes: [[Sequelize.fn('SUM', Sequelize.col('score')), 'totalScore']],
        include: {
          model: Models.Places,
          attributes: ['id', 'name', 'slug', 'logo', 'color', 'reward'],
          include: {
            model: Models.Punchcards,
            as: 'punchcard',
            attributes: ['id', 'name', 'point']
          },
        },
        group: ['punchcard_steps.userId', 'punchcard_steps.placeId', 'place.id', 'place.punchcard.id']
      }).catch((err) => console.log(err))
      if (!punchcard_steps) { return Response.NotFound('No information found!', []) }
      
      const result = []
      punchcard_steps.forEach(item => {
        const existingPlace = result.find(place => place.id === item.place.id)
        if (!existingPlace) {
          result.push({
            placeId: item.place.id,
            score: Number(item.dataValues.totalScore),
            name: item.place.name,
            slug: item.place.slug,
            color: item.place.color,
            rewar: item.place.reward,
            punchcards: [item.place.punchcard]
          })
        } else { existingPlace.punchcards.push(item.place.punchcard) }
      })
      if (result.length === 0) { return Response.NotFound('No information found!', []) }
      return Response.Success('Successful!', result)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async fetchPunchcardService(slug, userId) {
    try {
      const result = []
      const punchcard_steps = await Models.PunchCardSteps.findOne({
        where: { userId: userId, isActive: true, score: { [Op.gt]: 0 } },
        attributes: ['id', 'score'],
        include: {
          model: Models.Places,
          attributes: ['id', 'name', 'slug', 'color'],
          where: { slug: slug, isActive: true }
        }
      }).catch((err) => console.log(err))
      if (!punchcard_steps) { return Response.NotFound('No information found!', []) }
      result.push({ user: punchcard_steps })

      const punchcards = await Models.Punchcards.findAll({
        attributes: ['id', 'name', 'point', 'mealId'],
        where: { placeId: punchcard_steps.place.id, isActive: true },
      }).catch((err) => console.log(err))
      result.push({ punchcards: punchcards })

      return Response.Success('Successful!', result)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async fetchBasketService(userId, query) {
    try {
      const basket_payment = await Models.Baskets.findAndCountAll({
        where: { userId: userId, type: 'payment', isActive: true },
        attributes: ['id', 'count', 'score', 'type', 'extra_meals', 'meal_sizes'],
        include: {
          model: Models.Meals,
          where: { isActive: true },
          attributes: ['id', 'name', 'slug', 'price', 'point', 'img', 'ingredients', 'time', 'tax'],
          include: {
            model: Models.PlaceCategories,
            where: { isActive: true },
            attributes: ['placeId'],
            required: true,
            include: {
              model: Models.Places,
              attributes: ['name', 'slug', 'latitude', 'longitude'],
              required: true
            }
          }
        }
      }).catch((err) => console.log(err))
      const basket_punchcard = await Models.Baskets.findAndCountAll({
        where: { userId: userId, type: 'punchcard', isActive: true },
        attributes: ['id', 'count', 'type', 'extra_meals', 'meal_sizes'],
        include: {
          model: Models.Meals,
          where: { isActive: true },
          attributes: ['id', 'name', 'slug', 'price', 'point', 'img', 'time'],
          include: {
            model: Models.PlaceCategories,
            where: { isActive: true },
            attributes: ['placeId'],
            required: true,
            include: {
              model: Models.Places,
              attributes: ['name', 'slug', 'latitude', 'longitude'],
              required: true
            }
          }
        }
      }).catch((err) => console.log(err))
      basket_punchcard.rows.forEach((item) => {
        if (item.meal) {
          item.meal.price = 0
          item.meal.point = 0
          item.meal.tax = 0
        }
        if (item.extra_meals == null) item.extra_meals = []
        if (item.meal_sizes == null) item.meal_sizes = []
      })
      basket_payment.rows.forEach(async (item) => {
        if (item.extra_meals == null) item.extra_meals = []
        if (item.meal_sizes == null) item.meal_sizes = []
      })
      let data = { baskets: [] }
      let stepPrice = 0
      let totalPrice = 0
      let totalTime = 0
      let totalPoint = 0
      let totalTax = 0
      let array = basket_payment.rows
      if (basket_punchcard.count > 0) data.baskets.push(...basket_punchcard.rows)
      array.forEach(async (item) => {
        if (totalTime < item.meal.time) totalTime = item.meal.time
        stepPrice += Number(item.meal.price)
        item.extra_meals.forEach((extraMeal) => stepPrice += Number(extraMeal.price))
        item.meal_sizes.forEach((mealSize) => stepPrice += Number(mealSize.price))
        stepPrice = Number(stepPrice) * Number(item.count)
        item.dataValues.stepPrice = Number(stepPrice.toFixed(2))
        data.baskets.push(item)
        totalPrice += Number(stepPrice.toFixed(2))
        totalTax += Number(item.meal.tax) * Number(item.count)
        totalPoint += Number(item.score)
        stepPrice = 0
      })
      if (data.baskets.length === 0) { return Response.NotFound('No information found!', {}) }

      data.statistic = {
        totalPrice: Number(totalPrice.toFixed(2)),
        totalTime: Number(totalTime.toFixed(2)),
        totalPoint: Number(totalPoint.toFixed(2)),
        totalTax: Number(totalTax.toFixed(2))
      }
      
      let distance = { metres: 0, minutes: 0 }
      let place = basket_payment.rows[0]?.meal?.place_category?.place || basket_punchcard.rows[0]?.meal?.place_category?.place
      distance.metres = Math.abs(Number((await Functions.haversineDistance(query.lat, query.lon, place?.latitude, place?.longitude)).toFixed(2)))
      distance.minutes = Math.abs(Number((await Functions.walkingTime(distance.metres)).toFixed(2)))
      data.distance = distance

      return Response.Success('Successful!', data)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async fetchOrderService(userId) {
    try {
      const order = await Models.Orders.findOne({
        where: { userId: userId, status: { [Op.ne]: "Order Collected" } },
        attributes: { exclude: ['updatedAt', 'userId', 'placeId'] },
        include: {
          model: Models.Places,
          attributes: ['id', 'name', 'slug', 'logo']
        }
      }).catch((err) => console.log(err))
      if (!order) { return Response.NotFound('Order not found!', []) }
      const order_count = await Models.OrderItems.count({ where: { orderId: order.id } })
      order.dataValues.totalCount = order_count
      return Response.Success('Successful!', [order])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async fetchOrderDetailService(userId, id) {
    try {
      const order = await Models.Orders.findOne({
        where: { id: id, userId: userId },
        attributes: { exclude: ['placeId', 'userId', 'updatedAt'] },
        include: [
          {
            model: Models.OrderItems,
            attributes: { exclude: ['createdAt', 'updatedAt', 'orderId', 'mealId'] },
            required: true,
            include: {
              model: Models.Meals,
              attributes: ['id', 'name', 'slug', 'img', 'price', 'tax', 'point', 'ingredients']
            }
          },
          {
            model: Models.Places,
            attributes: ['id', 'name', 'slug', 'logo']
          }
        ]
      }).catch((err) => console.log(err))
      if (!order) { return Response.NotFound('Order detail not found!', {}) }
      let array = await order.order_items
      let totalPoint = 0
      let totalTax = 0
      array.forEach(async (item) => {
        if (item.meal) {
          totalPoint += Number(item.meal.point)
          totalTax += Number(item.meal.tax)
        }
      })
      let totalPrice = Number(await order.sum) + Number(await order.tip) + Number(totalTax)
      order.dataValues.statistic = {
        totalPrice: Number(totalPrice.toFixed(2)),
        totalPoint: Number(totalPoint.toFixed(2)),
        totalTax: Number(totalTax.toFixed(2))
      }
      return Response.Success('Successful!', order)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async fetchOrderHistoryService(userId) {
    try {
      const order = await Models.Orders.findAndCountAll({
          where: { userId: userId, status: "Order Collected" },
          attributes: { exclude: ['payment', 'userId', 'placeId', 'updatedAt'] },
          include: {
            model: Models.Places,
            required: true,
            attributes: ['id', 'name', 'slug', 'logo']
          }
      }).catch((err) => console.log(err))
      if (!order) { return Response.NotFound('Order history not found!', []) }
      return Response.Success('Successful!', order)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async userClaimService(query, userId) {
    try {
      const punchcard = await Models.PunchCardSteps.findOne({
        where: { userId: userId, isActive: true },
        attributes: ['id', 'score'],
        include: {
          model: Models.Places,
          where: { id: query.placeId, isActive: true },
          attributes: ['id', 'name', 'slug'],
          required: true,
          include: {
            model: Models.Punchcards,
            where: { id: query.punchcardId, isActive: true },
            attributes: { exclude: ['isActive', 'createdAt', 'updatedAt', 'placeId'] },
            required: true
          }
        }
      }).catch((err) => console.log(err))
      if (punchcard?.score >= punchcard?.place?.punchcard?.point) {
        const meal = await Models.Meals.findOne({
          where: { id: punchcard.place.punchcard.mealId },
          attributes: ['id']
        }).catch((err) => console.log(err))
        if (!meal) { return Response.NotFound('Food not found!', []) }

        const basket = await Models.Baskets.create({
          count: 1,
          score: punchcard.place.punchcard.point,
          type: 'punchcard',
          mealId: meal.id,
          userId: userId
        }).catch((err) => console.log(err))
        if (!basket) { return Response.BadRequest('Could not add to cart!', []) }

        const score = Number(punchcard.score) - Number(punchcard.place.punchcard.point)
        await Models.PunchCardSteps.update({ score: score },
          { where: { userId: userId, placeId: punchcard.place.id } })
            .then(() => console.log(true))
            .catch((err) => console.log(err))
            
        return Response.Success('Successful!', [])
      } else if (punchcard === null) {
        return Response.BadRequest('No points!', [])
      } else return Response.BadRequest('Insufficient points!', [])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  // DELETE
  async userDeleteBasketService(id, userId) {
    try {
      const basket = await Models.Baskets.findOne({
        where: { id: id, userId: userId, isActive: true },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        include: {
          model: Models.Meals,
          attributes: ['placeCategoryId'],
          include: {
            model: Models.PlaceCategories,
            attributes: ['placeId']
          }
        }
      }).catch((err) => console.log(err))
      if (!basket) { return Response.Forbidden('Not allowed!', []) }
      if (basket.type === 'punchcard') {
        const step = await Models.PunchCardSteps.findOne({
          where: { userId: userId, placeId: basket.meal.place_category.placeId }
        }).catch((err) => console.log(err))
        step.score += basket.score
        await step.save()
      }
      await Models.Baskets.destroy({
        where: { id: id, userId: userId, isActive: true },
      }).catch((err) => console.log(err))
      return Response.Success('Successfully deleted!', [])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
}

module.exports = new UserService()
