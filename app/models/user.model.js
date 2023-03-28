module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      isUnique :true,
    },
    phoneNumber: {
      type: Sequelize.STRING,
      isUnique :true,
      allowNull:false
    },
    agreedToTerms: {
      type: Sequelize.BOOLEAN,
      allowNull:false
    },
    otp: {
      type: Sequelize.STRING,
      allowNull:true
    },
    wasSmsSent: {
      type: Sequelize.BOOLEAN,
      allowNull:true,
    },
    validated: {
      type: Sequelize.BOOLEAN,
      allowNull:false,
    },
    resendCount: {
      type: Sequelize.INTEGER,
      allowNull:false,
    },
  });

  return User;
};
