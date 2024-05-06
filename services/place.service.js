const Models = require('../config/models')
const Functions = require('../helpers/functions.service')
const Response = require('../helpers/response.service')

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
}

module.exports = new PlaceService()
