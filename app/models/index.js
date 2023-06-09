// Import required modules
const config = require("../config/db.config.js");
const Sequelize = require("sequelize");

// Initialize Sequelize with configuration
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.dialect,
  operatorsAliases: false,
  port: 25060,
  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,
    idle: config.pool.idle,
  },
});

// Initialize database object
const db = {};

// Assign Sequelize and sequelize instance to database object
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.stock = require("../models/stock.model.js")(sequelize, Sequelize);
db.bill = require("../models/bill.model.js")(sequelize, Sequelize);
db.cart = require("../models/cart.model.js")(sequelize, Sequelize);
db.cart_stock = require("../models/cart_stock.model.js")(sequelize, Sequelize);
db.cart_bill = require("../models/cart_bill.model.js")(sequelize, Sequelize);

db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId"
});

db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId"
});

db.stock.belongsTo(db.user, {
  foreignKey: "userId",
  onDelete: "CASCADE"
});

db.stock.belongsToMany(db.cart, {
  through: db.cart_stock,
  foreignKey: "stockId",
  otherKey: "cartId"
});

db.cart.belongsToMany(db.stock, {
  through: db.cart_stock,
  foreignKey: "cartId",
  otherKey: "stockId"
});

db.cart.belongsTo(db.user, {
  foreignKey: "userId",
  onDelete: "CASCADE"
});

db.bill.belongsTo(db.user, {
  foreignKey: "userId",
  onDelete: "CASCADE"
});


// Define roles constants
db.ROLES = ["user", "admin", "moderator"];

// Export database object
module.exports = db;