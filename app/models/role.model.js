module.exports = (sequelize, Sequelize) => {
  const Role = sequelize.define("role", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    }
  });

  Role.associate = (models) => {
    Role.belongsToMany(models.User, {
      through: "user_roles",
      foreignKey: "roleId",
      otherKey: "userId"
    });
  };

  return Role;
};