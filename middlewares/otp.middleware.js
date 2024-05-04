const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try {
        let bearer = req.headers.authorization ? req.headers.authorization.split(' ')[0] : null
        let token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null
        if (!bearer || bearer.toLowerCase() !== 'bearer' || !token) {
            return res.json({ 
                status: 401,
                type: 'error',
                msg: 'Unsuccessful!',
                msg_key: 'unauthorized',
                detail: []
            })
        }
        const decoded = jwt.verify(token, process.env.PRIVATE_KEY)
        req.userDto = decoded
        return next()
    } catch (error) {
        return res.json({ 
            status: 500,
            type: 'error',
            msg: error.message,
            msg_key: error.name,
            detail: []
        })
    }
}