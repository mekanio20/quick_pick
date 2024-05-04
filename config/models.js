const { Sequelize, DataTypes } = require('sequelize')
const database = require('./database')

const Users = database.define('users', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    email: { type: DataTypes.STRING(50), allowNull: false, validate: { isEmail: true } },
    phone: { type: DataTypes.STRING(12), allowNull: false, unique: true },
    username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    img: { type: DataTypes.STRING, defaultValue: 'default_user.png' },
    password: { type: DataTypes.STRING(150), allowNull: false },
    firstname: { type: DataTypes.STRING(50), allowNull: false },
    lastname: { type: DataTypes.STRING(50), allowNull: false },
    birthday: { type: DataTypes.DATEONLY, allowNull: false },
    ip: { type: DataTypes.STRING(15), allowNull: true },
    device: { type: DataTypes.STRING(25), allowNull: true },
    uuid: { type: DataTypes.UUID, allowNull: false, unique: true },
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
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    type: { type: DataTypes.ENUM({ values: ['Cafe', 'Bakery', 'Restaurant', 'Bar'] }), allowNull: false },
    email: { type: DataTypes.STRING(50), allowNull: false, validate: { isEmail: true } },
    desc: { type: DataTypes.STRING, allowNull: false },
    phone_primary: { type: DataTypes.STRING(20), allowNull: false },
    phone_secondary: { type: DataTypes.STRING(20), allowNull: true },
    address: { type: DataTypes.STRING, allowNull: false },
    website: { type: DataTypes.STRING, allowNull: true },
    zipcode: { type: DataTypes.STRING(50), allowNull: true },
    latitude: { type: DataTypes.STRING, allowNull: false },
    longitude: { type: DataTypes.STRING, allowNull: false },
    logo: { type: DataTypes.STRING, allowNull: false },
    banner: { type: DataTypes.STRING, allowNull: true },
    color: { type: DataTypes.STRING(50), allowNull: true },
    copacity: { type: DataTypes.ENUM({ values: ['Quite', 'Moderate', 'Busy'] }), defaultValue: 'Quite' },
    dine_in: { type: DataTypes.BOOLEAN, defaultValue: true }, // otyryp iymek, alyp gitmek
    tax: { type: DataTypes.SMALLINT, defaultValue: 0 }, // otyryan yerin ucin toleg, prosentde
    open_close: { type: DataTypes.BOOLEAN, defaultValue: true },
    auto_accept: { type: DataTypes.BOOLEAN, defaultValue: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
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
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
})

const Meals = database.define('meals', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    desc: { type: DataTypes.STRING, allowNull: true },
    img: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DOUBLE, allowNull: false },
    point: { type: DataTypes.SMALLINT, defaultValue: 0 },
    time: { type: DataTypes.STRING(10), allowNull: false },
    type: { type: DataTypes.ENUM({ values: ['Meat', 'Vegan', 'Kosher', 'Vegetarian', 'Halal', 'Gluten Free'] }) },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
})

const ExtraMeals = database.define('extra_meals', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DOUBLE, allowNull: false }, // +0.25$
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
})

const MealSizes = database.define('meal_sizes', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    size: { type: DataTypes.ENUM({ values: ['Small', 'Medium', 'Large'] }), allowNull: false },
    price: { type: DataTypes.DOUBLE, defaultValue: 0 }, // +0.50$, 0.75$
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
})

const Allergens = database.define('allergens', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
})

const Promocodes = database.define('promocodes', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    code: { type: DataTypes.STRING(50), allowNull: false },
    min_price: { type: DataTypes.INTEGER, allowNull: false }, // 100$
    percentage: { type: DataTypes.SMALLINT, allowNull: false }, // 25%
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
})

const PromocodeUses = database.define('promocode_uses', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
})

const Baskets = database.define('baskets', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    quantity: { type: DataTypes.SMALLINT, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    extra_meals: { type: DataTypes.JSON, allowNull: true },
    meal_sizes: { type: DataTypes.JSON, allowNull: true },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
})

const Orders = database.define('orders', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, unique: true },
    status: { type: DataTypes.ENUM({ values: ['Order Placed', 'Preparation Started', 'Ready in 5 Minutes', 'Order Finished', 'Order Collected', 'Order Cancelled'] }), defaultValue: 'Order Placed' },
    payment: { type: DataTypes.ENUM({ values: ['Cash', 'Card'] }), allowNull: false },
    type: { type: DataTypes.ENUM({ values: ['Pick-up', 'Dine-in'] }), allowNull: false },
    sum: { type: DataTypes.DOUBLE, allowNull: false },
    note: { type: DataTypes.STRING, allowNull: true },
    tip: { type: DataTypes.DOUBLE, defaultValue: 0 }, // cay pul bermek ucin
    schedule: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
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
    point: { type: DataTypes.SMALLINT, allowNull: false },
    icon: { type: DataTypes.STRING, defaultValue: 'punchcard.png' },
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

// ExtraMeals -> MealId

Meals.hasMany(ExtraMeals, { onDelete: "cascade" })
ExtraMeals.belongsTo(Meals)

// MealSizes -> MealId

Meals.hasMany(MealSizes, { onDelete: "cascade" })
MealSizes.belongsTo(Meals)

// Allergens -> MealId

Meals.hasMany(Allergens, { onDelete: "cascade" })
Allergens.belongsTo(Meals)

// Promocodes -> PlaceId

Places.hasMany(Promocodes, { onDelete: "cascade" })
Promocodes.belongsTo(Places)

// PromocodeUses -> PromocodesId

Promocodes.hasMany(PromocodeUses)
PromocodeUses.belongsTo(Promocodes)

// PromocodeUses -> UserId

Users.hasMany(PromocodeUses)
PromocodeUses.belongsTo(Users)

// Baskets -> UserId

Users.hasMany(Baskets)
Baskets.belongsTo(Users)

// Baskets -> MealId

Meals.hasMany(Baskets)
Baskets.belongsTo(Meals)

// OrderItems -> OrderId

Orders.hasMany(OrderItems)
OrderItems.belongsTo(Orders)

// OrderItems -> UserId

Users.hasMany(OrderItems)
OrderItems.belongsTo(Users)

// OrderItems -> MealId

Meals.hasMany(OrderItems)
OrderItems.belongsTo(Meals)

// Punchcards -> PlaceId

Places.hasOne(Punchcards)
Punchcards.belongsTo(Places)

// PunchcardSteps -> PunchcardId

Punchcards.hasMany(PunchCardSteps)
PunchCardSteps.belongsTo(Punchcards)

// PunchcardSteps -> UserId

Users.hasMany(PunchCardSteps)
PunchCardSteps.belongsTo(Users)

module.exports = {
    Users, Places, Categories, PlaceImages, PlaceSchedules, 
    Meals, PlaceCategories, ExtraMeals, MealSizes, Allergens,
    Promocodes, Baskets, PromocodeUses, Orders, OrderItems, 
    Punchcards, PunchCardSteps
}