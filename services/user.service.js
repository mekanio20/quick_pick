const Verification = require('../helpers/verification.service')
const Functions = require('../helpers/functions.service')
const Response = require('../helpers/response.service')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const redis = require('../ioredis')
const Models = require('../config/models')
const { Op } = require('sequelize')
const jwt = require('jsonwebtoken')

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
  // GET
  async userProfileService(user) {
    try {
      const customer = await Models.Users.findOne({
        attributes: { exclude: ['password', 'ip', 'device', 'uuid', 'roleId', 'createdAt', 'updatedAt'] },
        where: {
          id: user.id,
          isActive: true
        }
      }).catch((err) => { console.log(err) })
      if (!customer) { return Response.Unauthorized('User not found!', []) }
      return Response.Success('Successful!', customer)
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
          attributes: ['id', 'name', 'slug'],
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
          attributes: ['id', 'name', 'slug'],
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
  async userLogoutService(userId) {
    try {
      await Models.Users.update({ isActive: false }, { where: { id: userId } })
        .catch((err) => console.log(err))
      const token = jwt.sign({}, process.env.PRIVATE_KEY, { expiresIn: 0 })
      return Response.Success('Successful!', { token })
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
}

module.exports = new UserService()
