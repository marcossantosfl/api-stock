const { verifySignUp, authJwt } = require("../middleware");
const controller = require("../controllers/auth.controller");
const { check, validationResult } = require('express-validator');

module.exports = function (app) {
  // Set headers for CORS
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept, Set-Cookie"
    );
    next();
  });

  // Route for registering a new user
  app.post(
    "/api/auth/register",
    [
      check('phoneNumber')
        .notEmpty().withMessage('phone number  required')
        .trim(),
        check('agreedToTerms').equals("true").withMessage('You must agree to the Terms and Conditions and Privacy Policy')
        .trim(),
      verifySignUp.checkRolesExisted,
      verifySignUp.checkDuplicateNumber
    ],
    handleValidationErrors,
    controller.signup
  );

  // Route for verifying SMS verification code
  app.post("/api/auth/verify", [
    check('userId').notEmpty().withMessage('user id required').trim(),
    check('otp').notEmpty().withMessage('otp required').trim(),
  ], handleValidationErrors, controller.verifyCode);

  app.post("/api/auth/resend", [
    check('userId').notEmpty().withMessage('user id required').trim(),
    ], handleValidationErrors, controller.resendCode);

    app.post("/api/auth/stocks", [
      check('userId').notEmpty().withMessage('user id required').trim(),
      check('stocks.*.name').notEmpty().withMessage('Stock name is required').trim(),
      check('stocks.*.value').notEmpty().withMessage('Stock value is required').trim(),
      check('stocks.*.amount').notEmpty().withMessage('Stock amount is required').trim(),
    ], handleValidationErrors, 
    authJwt.verifyToken,
    controller.createStock);

    app.get("/api/auth/stocks/:userId", [
    ], handleValidationErrors, 
    authJwt.verifyToken,
    controller.getAllStocks);

    app.post("/api/auth/stocks/:userId/:id", [
    ], handleValidationErrors, 
    authJwt.verifyToken,
    controller.updateStock);

    app.get("/api/auth/bill/:userId", 
    authJwt.verifyToken,
    controller.getBill);

    app.post("/api/auth/bill/:userId/mark-as-delivered", [
      check('userId').notEmpty().withMessage('user id required').trim(),
    ], handleValidationErrors, 
    authJwt.verifyToken,
    controller.markAsDelivered);

    app.post("/api/auth/bill/:userId/close", [
      check('userId').notEmpty().withMessage('user id required').trim(),
    ], handleValidationErrors, 
    authJwt.verifyToken,
    controller.closeBill);
};

// Middleware function to handle validation errors for routes that use express-validator
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array() });
  }
  next();
}