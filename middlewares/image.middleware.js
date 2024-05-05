const multer = require('multer')
const uuid = require('uuid')
const path = require('path')
const fs = require('fs')

module.exports = (dest) => {
    const filepath = path.resolve(__dirname, '..', 'public', dest)
    if (!fs.existsSync(filepath)) {
        fs.mkdirSync(filepath, { recursive: true })
    }
    const multerFilter = (req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
            cb(null, true)
        } else {
            cb(new Error('The file is not an image!'))
        }
    }
    return multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => { cb(null, path.resolve(__dirname, '..', 'public', dest)) },
            filename: (req, file, cb) => {
                cb(null, `${uuid.v4()}-${file.originalname}`)
            }
        }),
        fileFilter: multerFilter
    })
}