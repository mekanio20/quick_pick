const jwt = require('jsonwebtoken')

module.exports = function (requiredRoles) {
    return function (req, res, next) {
        try {
            const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null
            if (!token) {
                return res.json({ 
                    status: 401,
                    type: 'error',
                    msg: 'Unsuccessful!',
                    msg_key: 'unauthorized',
                    detail: []
                })
            }
            const decoded = jwt.verify(token, process.env.PRIVATE_KEY)
            const access = requiredRoles.includes(decoded.role)
            console.log(decoded, access)
            if (!access) {
                return res.json({ 
                    status: 401,
                    type: 'error',
                    msg: 'Unsuccessful!',
                    msg_key: 'unauthorized',
                    detail: []
                })
            }
            return next()
        } catch (error) {
            throw error
        }
    }
}