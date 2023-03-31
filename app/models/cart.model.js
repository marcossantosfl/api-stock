module.exports = (sequelize, Sequelize) => {
  const Cart = sequelize.define("cart", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cartId: {
      type: Sequelize.STRING,
      allowNull: false
    },
    isClosed: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    }
  });

  Cart.associate = (models) => {
    Cart.belongsToMany(models.Stock, { through: "cart_stock" });
    Cart.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE"
    });
  };

  return Cart;
};