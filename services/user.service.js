const Verification = require('../helpers/verification.service')
const Functions = require('../helpers/functions.service')
const Response = require('../helpers/response.service')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const redis = require('../ioredis')
const Models = require('../config/models')
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')

class UserService {
  // POST
  async userRegisterService(body, ip, os) {
    try {
      const user = await Verification.isExists(body.email, true)
      if (user) { return Response.BadRequest("User already exists!", []) }
      const code = (100000 + Math.floor(Math.random() * 100000)).toString()
      await redis.set(body.email, code)
      await redis.expire(body.email, 300)
      const hash = await bcrypt.hash(body.password, 5)
      let customer = {
        email: body.email,
        password: hash,
        username: body.username || null,
        fullname: body.fullname || null,
        phone: body.phone || null,
        ip: ip,
        os: os,
        uuid: uuid.v4(),
        roleId: 2
      }
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
      return Response.Success('Email sent successfully!', { token })
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async userVerificationService(code, user) {
    try {
      const systemcode = await redis.get(user.email)
      if (String(code) !== systemcode) { return Response.BadRequest('The verification code is invalid', []) }
      const customer = await Models.Users.create(user)
        .catch((err) => { console.log(err) })
      if (!customer) { return Response.BadRequest('An unknown error occurred!', []) }
      const token = await Functions.generateJwt({ id: customer.id, role: "user" })
        .catch((err) => { console.log(err) })
      return Response.Created('User is registered!', { token })
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async userLoginService(body) {
    try {
      const user = await Models.Users.findOne({ where: { email: body.email } })
      if (!user) { return Response.Unauthorized('User not found!', []) }
      const hash = await bcrypt.compare(body.password, user.password)
      if (!hash) { return Response.Forbidden('Password is incorrect', []) }
      user.isActive = true
      await user.save()
      const token = await Functions.generateJwt({ id: user.id, role: "user" })
      return Response.Success('Login confirmed', { token })
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async userAddBasketService(body, userId) {
    try {
      body.userId = userId
      const basket = await Models.Baskets.create(body)
      if (!basket) { return Response.BadRequest('Error occurred!', []) }
      return Response.Created('Created successfully!', [])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  // PUT
  async userUpdateProfileService(body, img, userId) {
    try {
      const obj = {}
      if (img?.filename) obj.img = img.filename
      if (body?.password) {
        const hash = await bcrypt.hash(body.password, 5)
        obj.password = hash
      }
      if (body?.email) {
        const isExist = await Models.Users.findOne({ where: { email: body.email } })
        if (isExist) return Response.BadRequest('The user for this email already exists!', [])
        obj.email = body.email
      }
      for (const item in body) {
        if (item && item !== 'password' && item !== 'email')
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
      const isExist = await Models.Baskets.findOne({
        where: { isActive: true, mealId: body.mealId, userId: userId },
        attributes: ['id'],
     }).catch((err) => console.log(err))
     if (isExist) {
      const obj = {}
      for (const item in body) if (item) obj[item] = body[item]
      await Models.Baskets.update(obj, { where: { id: isExist.id } })
        .catch((err) => console.log(err))
      return Response.Success('Successfully updated!', [])
    }
    return Response.BadRequest('An unknown error occurred!', [])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  // GET
  async userProfileService(user) {
    try {
      const customer = await Models.Users.findOne({
        where: { id: user.id, isActive: true },
        attributes: { exclude: ['password', 'ip', 'os', 'uuid', 'roleId', 'isActive', 'createdAt', 'updatedAt'] }
      }).catch((err) => { console.log(err) })
      if (!customer) { return Response.Unauthorized('User not found!', []) }
      return Response.Success('Successful!', customer)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async fetchAllPunchcardsService(userId) {
    try {
      const punchcard_steps = await Models.PunchCardSteps.findAll({
        where: {
          userId: userId, 
          isActive: true,
          score: { [Op.gt]: 0 }
        },
        attributes: ['id', 'score'],
        include: {
          model: Models.Places,
          attributes: ['id', 'name', 'slug', 'color'],
          where: { isActive: true },
          include: {
            model: Models.Punchcards,
            attributes: ['id', 'name', 'point', 'mealId'],
            where: { isActive: true }
          }
        }
      }).catch((err) => console.log(err))
      if (!punchcard_steps) { return Response.NotFound('No information found!', []) }
      
      const result = []
      punchcard_steps.forEach(item => {
        const existingPlace = result.find(place => place.id === item.place.id)
        if (!existingPlace) {
          result.push({
            id: item.place.id,
            name: item.place.name,
            slug: item.place.slug,
            score: item.score,
<<<<<<< HEAD
	    color: item.place.color,
=======
            color: item.place.color,
>>>>>>> 8f2a3ef363b58e2a203a710469419d935574db9f
            punchcards: [item.place.punchcard]
          })
        } else {
          existingPlace.punchcards.push(item.place.punchcard)
        }
      })
      return Response.Success('Successful!', result)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async fetchPunchcardService(slug, userId) {
    try {
      const result = []
      const punchcard_steps = await Models.PunchCardSteps.findOne({
        where: { userId: userId, isActive: true },
        attributes: ['id', 'score'],
        include: {
          model: Models.Places,
          attributes: ['id', 'name', 'slug', 'color'],
          where: { slug: slug, isActive: true }
        }
      }).catch((err) => console.log(err))
      if (!punchcard_steps) { return Response.NotFound('No information found!', []) }
      result.push({ user: punchcard_steps})

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
  async fetchBasketService(slug, userId) {
    try {
      const basket = await Models.Baskets.findAndCountAll({
        where: { isActive: true, userId: userId },
        attributes: ['id', 'count', 'extra_meals', 'meal_sizes'],
        include: {
          model: Models.Meals,
          where: { isActive: true },
          attributes: ['id', 'name', 'slug', 'price', 'point', 'img', 'time'],
          include: {
            model: Models.PlaceCategories,
            where: { isActive: true },
            attributes: [],
            required: true,
            include: {
              model: Models.Places,
              where: { slug: slug },
              attributes: ['slug'],
              required: true
            }
          }
        }
      }).catch((err) => console.log(err))
      if (basket.count === 0) { return Response.NotFound('No information found!', []) }
      return Response.Success('Successful!', basket)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  // async userLogoutService(userId) {
  //   try {
  //     await Models.Users.update({ isActive: false }, { where: { id: userId } })
  //       .catch((err) => console.log(err))
  //     const token = jwt.sign({}, process.env.PRIVATE_KEY, { expiresIn: 0 })
  //     return Response.Success('Successful!', { token })
  //   } catch (error) {
  //     throw { status: 500, type: "error", msg: error, detail: [] }
  //   }
  // }
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
        
      } else return Response.BadRequest('Insufficient points!', [])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  // DELETE
  async userDeleteBasketService(id, userId) {
    try {
      const basket = await Models.Baskets.destroy({
        where: { id: id, userId: userId, isActive: true }
      }).catch((err) => console.log(err))
      if (!basket) { return Response.Forbidden('Not allowed!', []) }
      return Response.Success('Successfully deleted!', [])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
}

module.exports = new UserService()
