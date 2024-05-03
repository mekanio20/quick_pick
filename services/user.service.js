const Models = require('../config/models')

class UserService {
  // POST
  async userRegisterService(body, ip, device) {
    try {
      const user = await Verification.isExists(body.phone)
      if (user) { return Response.BadRequest("User already exists!", []) }
      const hash = await bcrypt.hash(body.password, 5)
      let _user = {
        phone: body.phone,
        password: hash,
        ip: ip,
        device: device,
        uuid: uuid.v4()
      };
      const response = await this.sendOtpService(_user);
      return response;
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] };
    }
  }
}

module.exports = new UserService()
