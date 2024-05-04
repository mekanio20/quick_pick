module.exports = (schema, property) => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property])
        const valid = error == null
        if (valid) { next() } 
        else {
            return res.status(400).json({
                status: 400,
                type: 'error',
                msg: error.message,
                msg_key: error.name,
                detail: []
            })
        }
    }
}