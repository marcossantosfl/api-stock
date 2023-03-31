module.exports = (sequelize, Sequelize) => {
    const CartBill = sequelize.define("cart_bill", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      cartId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "carts",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      billId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "bills",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      }
    });
  
    CartBill.associate = (models) => {
      CartBill.belongsTo(models.Cart, {
        foreignKey: "cartId",
        onDelete: "CASCADE"
      });
      CartBill.belongsTo(models.Bill, {
        foreignKey: "billId",
        onDelete: "CASCADE"
      });
    };
  
    return CartBill;
  };
  