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
  async addMinutesToTime(time, minutesToAdd) {
    let [timePart, modifier] = time.split(" ")
    let [hours, minutes, seconds] = timePart.split(":").map(Number)

    if (modifier === "PM" && hours !== 12) { hours += 12 }
    else if (modifier === "AM" && hours === 12) { hours = 0 }

    let date = new Date()
    date.setHours(hours, minutes, seconds, 0)
    date.setMinutes(date.getMinutes() + minutesToAdd)

    let newHours = date.getHours()
    let newMinutes = date.getMinutes()
    let newSeconds = date.getSeconds()
    let newModifier = newHours >= 12 ? "PM" : "AM"

    newHours = newHours % 12
    newHours = newHours ? newHours : 12

    newHours = newHours < 10 ? "0" + newHours : newHours
    newMinutes = newMinutes < 10 ? "0" + newMinutes : newMinutes
    newSeconds = newSeconds < 10 ? "0" + newSeconds : newSeconds

    return `${newHours}:${newMinutes}:${newSeconds} ${newModifier}`
  }
}

module.exports = new Functions()