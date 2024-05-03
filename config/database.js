const { Sequelize } = require("sequelize")

module.exports = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        dialect: "postgres",
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialectOptions: {
            useUTC: false
        },
        logging: false,
        pool: {
            min: 0,
            max: 10000,
            acquire: 30000,
            idle: 60000
        }
    }
)