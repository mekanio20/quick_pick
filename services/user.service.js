const Verification = require('../helpers/verification.service')
const Functions = require('../helpers/functions.service')
const Response = require('../helpers/response.service')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const redis = require('../ioredis')
const Models = require('../config/models')

class UserService {
  // POST
  async userRegisterService(body, ip, device) {
    try {
      const user = await Verification.isExists(body.email)
      if (user) { return Response.BadRequest("User already exists!", []) }
      const code = (100000 + Math.floor(Math.random() * 100000)).toString()
      await redis.set(body.email, code)
      await redis.expire(body.email, 300)
      const hash = await bcrypt.hash(body.password, 5)
      let customer = {
        email: body.email,
        phone: body.phone,
        username: body.username,
        firstname: body.firstname,
        lastname: body.lastname,
        password: hash,
        ip: ip,
        device: device,
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
      if (!customer) { return Response.BadRequest('An unknown error occurred', []) }
      const token = await Functions.generateJwt({ id: customer.id, email: customer.email, role: "user" })
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
      const token = await Functions.generateJwt({ id: user.id, email: user.email, role: "user" })
      return Response.Success('Login confirmed', { token })
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  // GET
  async userProfileService(user) {
    try {
      const customer = await Models.Users.findOne({
        attributes: { exclude: ['password', 'ip', 'device', 'uuid', 'createdAt', 'updatedAt'] },
        where: {
          id: user.id,
          email: user.email,
          isActive: true
        }
      }).catch((err) => { console.log(err) })
      if (!customer) { return Response.Unauthorized('User not found!', []) }
      return Response.Success('Successful!', customer)
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
  async userRewardsService(user) {
    try {
      
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
}

module.exports = new UserService()
