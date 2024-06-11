const { Sequelize, DataTypes } = require('sequelize')
const database = require('./database')

const Roles = database.define('roles', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    name: { type: DataTypes.STRING(10), allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
})

const Users = database.define('users', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    email: { type: DataTypes.STRING(50), allowNull: false, validate: { isEmail: true }, unique: true },
    fullname: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    img: { type: DataTypes.STRING, defaultValue: 'default_user.png' },
    birthday: { type: DataTypes.STRING, allowNull: true },
    username: { type: DataTypes.STRING(50), allowNull: true },
    ip: { type: DataTypes.STRING(15), allowNull: true },
    os: { type: DataTypes.STRING(25), allowNull: true },
    uuid: { type: DataTypes.UUID, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
})

const Categories = database.define('categories', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
})

const Places = database.define('places', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    type: { type: DataTypes.ENUM({ values: ['Cafe', 'Bakery', 'Restaurant', 'Bar'] }), allowNull: false },
    email: { type: DataTypes.STRING(50), allowNull: false, validate: { isEmail: true }, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    desc: { type: DataTypes.STRING, allowNull: true },
    phone_primary: { type: DataTypes.STRING(20), allowNull: false },
    phone_secondary: { type: DataTypes.STRING(20), allowNull: true },
    address: { type: DataTypes.STRING, allowNull: false },
    website: { type: DataTypes.STRING, allowNull: true },
    zipcode: { type: DataTypes.STRING(50), allowNull: true },
    rating: { type: DataTypes.DOUBLE, defaultValue: 0 },
    latitude: { type: DataTypes.DOUBLE, allowNull: false },
    longitude: { type: DataTypes.DOUBLE, allowNull: false },
    logo: { type: DataTypes.STRING, allowNull: true },
    banner: { type: DataTypes.STRING, allowNull: true },
    reward: { type: DataTypes.STRING, defaultValue: 'reward.png' },
    color: { type: DataTypes.STRING(50), allowNull: true },
    copacity: { type: DataTypes.ENUM({ values: ['Quite', 'Moderate', 'Busy'] }), defaultValue: 'Quite' },
    dine_in: { type: DataTypes.BOOLEAN, defaultValue: true }, // otyryp iymek, alyp gitmek
    open_close: { type: DataTypes.BOOLEAN, defaultValue: true },
    auto_accept: { type: DataTypes.BOOLEAN, defaultValue: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: false },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
})

const PlaceImages = database.define('place_images', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    img: { type: DataTypes.STRING, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
})

const PlaceSchedules = database.define('place_schedules', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    day: { type: DataTypes.ENUM({ values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }), allowNull: false },
    open_time: { type: DataTypes.STRING(10), allowNull: false },
    close_time: { type: DataTypes.STRING(10), allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
})

const PlaceCategories = database.define('place_categories', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
})

const Meals = database.define('meals', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    img: { type: DataTypes.STRING, allowNull: true },
    price: { type: DataTypes.DOUBLE, allowNull: false },
    point: { type: DataTypes.SMALLINT, defaultValue: 0 },
    tax: { type: DataTypes.SMALLINT, defaultValue: 0 },
    time: { type: DataTypes.SMALLINT, allowNull: false },
    ingredients: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.ENUM({ values: ['Meat', 'Vegan', 'Kosher', 'Vegetarian', 'Halal', 'Gluten Free'] }) },
    extra_meals: { type: DataTypes.ARRAY(DataTypes.JSON(DataTypes.STRING)), allowNull: true },
    meal_sizes: { type: DataTypes.ARRAY(DataTypes.JSON(DataTypes.STRING)), allowNull: true },
    allergens: { type: DataTypes.ARRAY(DataTypes.JSON(DataTypes.STRING)), allowNull: true },
    recomendo: { type: DataTypes.BOOLEAN, defaultValue: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
})

const Promotions = database.define('promotions', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    code: { type: DataTypes.STRING(50), allowNull: false },
    limit: { type: DataTypes.INTEGER, allowNull: false },
    percentage: { type: DataTypes.SMALLINT, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
})

const PromotionUses = database.define('promotion_uses', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
})

const Baskets = database.define('baskets', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    count: { type: DataTypes.SMALLINT, defaultValue: 1 },
    type: { type: DataTypes.ENUM({ values: ['punchcard', 'payment'] }), defaultValue: 'payment' },
    extra_meals: { type: DataTypes.ARRAY(DataTypes.JSON(DataTypes.STRING)), allowNull: true },
    meal_sizes: { type: DataTypes.ARRAY(DataTypes.JSON(DataTypes.STRING)), allowNull: true },
    score: { type: DataTypes.INTEGER, defaultValue: 0 }, // punchcard ucin gerek
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
})

const Orders = database.define('orders', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    status: { type: DataTypes.ENUM({ values: ['Order Placed', 'Preparation Started', 'Ready in 5 Minutes', 'Order Finished', 'Order Collected'] }), defaultValue: 'Order Placed' },
    type: { type: DataTypes.ENUM({ values: ['Pick-up', 'Dine-in'] }), allowNull: false },
    sum: { type: DataTypes.DOUBLE, allowNull: false },
    note: { type: DataTypes.STRING, allowNull: true },
    time: { type: DataTypes.INTEGER, defaultValue: 0 },
    tip: { type: DataTypes.DOUBLE, defaultValue: 0 }, // cay pul bermek ucin
    payment: { type: DataTypes.BOOLEAN, defaultValue: false },
    schedule: { type: DataTypes.DATE, allowNull: true },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
})

const OrderItems = database.define('order_items', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    quantity: { type: DataTypes.SMALLINT, allowNull: false },
    total_price: { type: DataTypes.DOUBLE, allowNull: false },
    extra_meals: { type: DataTypes.JSON, allowNull: true },
    meal_sizes: { type: DataTypes.JSON, allowNull: true },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
})

const Punchcards = database.define('punchcards', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    name: { type: DataTypes.STRING(100), allowNull: false }, // free fries
    point: { type: DataTypes.SMALLINT, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
})

const PunchCardSteps = database.define('punchcard_steps', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    score: { type: DataTypes.SMALLINT, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
})

const StripeAccounts = database.define('stripe_accounts', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    stripe: { type: DataTypes.STRING, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
})

// StripeAccounts -> PlaceId

Places.hasOne(StripeAccounts)
StripeAccounts.belongsTo(Places)

// ---------

// Users -> RoleId

Roles.hasMany(Users)
Users.belongsTo(Roles)

// Place -> CategoryId

Categories.hasMany(Places)
Places.belongsTo(Categories)

// PlaceImages -> PlaceId

Places.hasMany(PlaceImages, { onDelete: "cascade" })
PlaceImages.belongsTo(Places)

// PlaceSchedules -> PlaceId

Places.hasMany(PlaceSchedules, { onDelete: "cascade" })
PlaceSchedules.belongsTo(Places)

// PlaceCategories -> PlaceId

Places.hasMany(PlaceCategories, { onDelete: "cascade" })
PlaceCategories.belongsTo(Places)

// Meals -> PlaceCategoryId

PlaceCategories.hasMany(Meals, { onDelete: "cascade" })
Meals.belongsTo(PlaceCategories)

// Promotions -> PlaceId

Places.hasMany(Promotions, { onDelete: "cascade" })
Promotions.belongsTo(Places)

// PromotionUses -> PromotionsId

Promotions.hasMany(PromotionUses)
PromotionUses.belongsTo(Promotions)

// PromotionUses -> UserId

Users.hasMany(PromotionUses)
PromotionUses.belongsTo(Users)

// Orders -> UserId

Users.hasMany(Orders)
Orders.belongsTo(Users)

// Orders -> PlaceId

Places.hasMany(Orders)
Orders.belongsTo(Places)

// OrderItems -> OrderId

Orders.hasMany(OrderItems)
OrderItems.belongsTo(Orders)

// OrderItems -> MealId

Meals.hasMany(OrderItems, { onDelete: "cascade" })
OrderItems.belongsTo(Meals)

// Punchcards -> PlaceId

Places.hasOne(Punchcards)
Punchcards.belongsTo(Places)

// Punchcards -> MealId

Meals.hasOne(Punchcards)
Punchcards.belongsTo(Meals)

// PunchcardSteps -> PlaceId

Places.hasMany(PunchCardSteps)
PunchCardSteps.belongsTo(Places)

// PunchcardSteps -> UserId

Users.hasMany(PunchCardSteps)
PunchCardSteps.belongsTo(Users)

// Baskets -> UserId

Users.hasMany(Baskets)
Baskets.belongsTo(Users)

// Baskets -> MealId

Meals.hasMany(Baskets, { onDelete: "cascade" })
Baskets.belongsTo(Meals)

module.exports = {
    Roles, Users, Places, Categories, PlaceImages, PlaceSchedules, 
    Meals, PlaceCategories, Promotions, PromotionUses, Orders, OrderItems, 
    Punchcards, PunchCardSteps, Baskets, StripeAccounts
}