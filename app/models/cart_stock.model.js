module.exports = (sequelize, Sequelize) => {
  const CartStock = sequelize.define("cart_stock", {
    cartId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: {
        model: "carts",
        key: "id"
      }
    },
    stockId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: {
        model: "stocks",
        key: "id"
      }
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    price: {
      type: Sequelize.FLOAT,
      allowNull: false
    }
  }, {
    timestamps: false
  });

  CartStock.associate = (models) => {
    CartStock.belongsTo(models.Cart, { foreignKey: "cartId" });
    CartStock.belongsTo(models.Stock, { foreignKey: "stockId" });
  };

  return CartStock;
};
