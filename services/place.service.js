const Models = require('../config/models')
const Functions = require('../helpers/functions.service')
const Response = require('../helpers/response.service')

class PlaceService {
  // POST
  async placeAddAlbumService(placeId, files) {
    try {
      if (files?.photo?.length > 0) {
        for (let file of files.photo) {
          await Models.PlaceImages.create({
            id: Number(placeId),
            img: file.filename
          })
        }
      } else return Response.BadRequest('No file!', [])
      return Response.Created('Created successfully!', [])
    } catch (error) {
      throw { status: 500, type: "error", msg: error, detail: [] }
    }
  }
}

module.exports = new PlaceService()
