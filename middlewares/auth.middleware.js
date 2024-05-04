const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try {
        let bearer = req.headers.authorization ? req.headers.authorization.split(' ')[0] : null
        let token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null
        console.log('Bearer --> ', bearer, 'Token --> ', token)
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
        console.log('AUTH DECODED --> ', decoded)
        req.user = decoded
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