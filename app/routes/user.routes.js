const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");
const { check, validationResult } = require('express-validator');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept, Set-Cookie");
    next();
  });


};
