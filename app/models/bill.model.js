module.exports = (sequelize, Sequelize) => {
  const Bill = sequelize.define("bill", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    earn: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    toPay: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    toPayTotal: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    paid: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    },
    end: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    }
  });

  Bill.associate = (models) => {
    Bill.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE"
    });
    Bill.belongsToMany(models.Cart, { through: "cart_bill" });

    Bill.belongsToMany(models.Cart, {
      through: "cart_bill" ,
      foreignKey: 'cartId'
    });
  };

  return Bill;
};