module.exports = (sequelize, Sequelize) => {
  const Stock = sequelize.define("stock", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    value: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    amount: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  });


  Stock.associate = (models) => {
    Stock.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE"
    });

    Stock.belongsToMany(models.Cart, {
      through: models.CartStock,
      foreignKey: 'stockId'
    });
  };

  return Stock;
};