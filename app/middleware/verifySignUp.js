const {  } = require("../models");
const { Encrypter } = require("../middleware/crypto");
const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

const encrypter = new Encrypter();

checkDuplicateNumber = (req, res, next) => {

  phoneNumber = req.body.phoneNumber;

  phoneNumber = phoneNumber.replace(/\s+/g, '');

    // Email
    User.findOne({
      where: {
        phoneNumber: phoneNumber
      }
    }).then(user => {
      if (user) {
        res.status(400).send({
          message: "Failed! Student Number is already in use!"
        });
        return;
      }

      next();
  });
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: "Failed! Role does not exist = " + req.body.roles[i]
        });
        return;
      }
    }
  }
  
  next();
};

const verifySignUp = {
  checkDuplicateNumber: checkDuplicateNumber,
  checkRolesExisted: checkRolesExisted
};

module.exports = verifySignUp;
