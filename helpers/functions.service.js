const jwt = require("jsonwebtoken");

class Functions {
  async generateJwt(data, duration) {
    try {
      return jwt.sign(data, process.env.PRIVATE_KEY, {
        expiresIn: duration || "30d",
      });
    } catch (error) {
      throw {
        status: 500,
        type: "error",
        msg: error.message,
        msg_key: error.name,
        detail: [],
      }
    }
  }
  async generateSlug(name) {
    try {
      return name.split(" ").join("-").toLowerCase()
    } catch (error) {
      throw {
        status: 500,
        type: "error",
        msg: error.message,
        msg_key: error.name,
        detail: [],
      }
    }
  }
  async haversineDistance(lat1 = 0, lon1 = 0, lat2 = 0, lon2 = 0) {
    try {
      const toRad = (value) => value * Math.PI / 180
  
      const R = 6371
      const dLat = toRad(lat2 - lat1)
      const dLon = toRad(lon2 - lon1)
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distanceKm = R * c
      const distanceMeters = distanceKm * 1000
    
      return distanceMeters
    } catch (error) {
      throw {
        status: 500,
        type: "error",
        msg: error.message,
        msg_key: error.name,
        detail: [],
      }
    }
  }
  async walkingTime(distanceMeters) {
    try {
      const averageWalkingSpeedMetersPerMinute = 83.33
      const timeInMinutes = distanceMeters / averageWalkingSpeedMetersPerMinute
    
      return timeInMinutes
    } catch (error) {
      throw {
        status: 500,
        type: "error",
        msg: error.message,
        msg_key: error.name,
        detail: [],
      }
    }
  }
}

module.exports = new Functions()