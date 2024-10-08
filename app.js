const cors = require('cors')
const morgan = require('morgan')
const express = require('express')
const helmet = require('helmet')
const path = require('path')
const fs = require('fs')

require('dotenv').config()
const app = express()
const ip = 'localhost'
const port = process.env.PORT || 5001

require('./config/models')
const database = require('./config/database')
const router = require('./routers/index.router')

app.disable('x-powered-by')
app.use(cors({ origin: true }))
app.use(helmet())

let accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
app.use(morgan('common', { stream: accessLogStream }))
app.use(morgan('dev'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('public'))

app.use('/api/v1', router)
app.all('*', (req, res) => { return res.status(404).sendFile(`${path.join(__dirname + '/public/404.html')}`) })

app.listen(port, async () => {
    try {
        await database.authenticate()
        await database.sync({})
        console.log('Database connected...')
        console.log(`Server is running: http://${ip}:${port}`)
    } catch (error) {
        throw error
    }
})