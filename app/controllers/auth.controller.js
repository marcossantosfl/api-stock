// Import required modules and configurations
const db = require("../models");
const config = require("../config/auth.config");
const { Encrypter } = require("../middleware/crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Op = db.Sequelize.Op;

// Destructure models
const { user: User, role: Role, stock: Stock, bill: Bill } = db;

// Initialize encrypter
const encrypter = new Encrypter();

// Function to handle user signup
exports.signup = async (req, res) => {
  try {

    phoneNumber = req.body.phoneNumber;

    phoneNumber = phoneNumber.replace(/\s+/g, '');

    // Generate encrypted serial
    const code = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);

    // Create new user in database
    const user = await User.create({
      phoneNumber: phoneNumber,
      otp: encrypter.encrypt(code.toString()),
      agreedToTerms: req.body.agreedToTerms,
      validated: false,
      resendCount: 0
    });


    // Assign roles to user
    if (req.body.roles) {
      const roles = await Role.findAll({
        where: {
          name: {
            [Op.or]: req.body.roles,
          },
        },
      });
      await user.setRoles(roles);
    } else {
      // Assign default role (1) to user
      await user.setRoles([1]);
    }

    require("dotenv").config();
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require("twilio")(accountSid, authToken);

    const message = await client.messages.create({
      body: `Stock: Your OTP code is: ${code}, please do not share with anyone else`,
      from: "++14346867271",
      to: phoneNumber,
    });

    if (message.status === "queued" || message.status === "sent") {
      await User.update(
        { wasSmsSent: true, resendCount: 1 },
        { where: { id: user.id } }
      );
    }
    else {
      await User.update({ wasSmsSent: false }, { where: { id: user.id } });
      return res.status(500).send({ error: "SMS not sent" });
    }

    const userId = encrypter.encrypt(user.id.toString());

    res.send({ message: "User registered", userId: userId });

  } catch (err) {
    console.log(err.message)
    res.status(500).send({ message: err.message });
  }
};

// Function to handle user sign-in
exports.signin = async (req, res) => {
  try {
    // Get phone number from request body
    const phoneNumber = req.body.phoneNumber;

    // Remove whitespace from phone number
    const cleanedPhoneNumber = phoneNumber.replace(/\s+/g, '');

    // Find user in database with matching phone number
    const user = await User.findOne({ where: { phoneNumber: cleanedPhoneNumber } });

    // If no user found, return error response
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Generate encrypted user ID and OTP code
    const userId = encrypter.encrypt(user.id.toString());
    const code = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
    const encryptedCode = encrypter.encrypt(code.toString());

    // Send SMS with OTP code
    require("dotenv").config();
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require("twilio")(accountSid, authToken);

    const message = await client.messages.create({
      body: `Stock: Your OTP code is: ${code}, please do not share with anyone else`,
      from: "++14346867271",
      to: cleanedPhoneNumber,
    });

    if (message.status !== "queued" && message.status !== "sent") {
      // If SMS failed to send, return error response
      return res.status(500).send({ message: "SMS not sent" });
    }

    // Update user in database with new OTP code and reset resend count
    await User.update(
      { otp: encryptedCode, wasSmsSent: true, resendCount: 0 },
      { where: { id: user.id } }
    );

    res.send({ message: "OTP code sent", userId: userId });

  } catch (err) {
    console.log(err.message)
    res.status(500).send({ message: err.message });
  }
};

// Verify code
exports.verifyCode = async (req, res) => {
  const decryptedId = encrypter.dencrypt(req.body.userId);

  try {
    const user = await User.findOne({ where: { id: decryptedId } });

    const codeDecrypted = encrypter.dencrypt(user.otp);
    const codeRequest = req.body.otp;

    if (codeDecrypted === codeRequest.toString()) {
      await User.update(
        { validated: true },
        { where: { id: decryptedId } }
      );

      // Generate JWT token
      const token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: config.jwtExpiration,
      });

      return res.status(200).send({
        accessToken: token,
      });
    } else {
      return res.status(403).send({ error: "Invalid code" });
    }
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};


// Resend code
const MAX_RESEND_COUNT = 3;
exports.resendCode = async (req, res) => {

  const decryptedId = encrypter.dencrypt(req.body.userId);

  try {
    const user = await User.findOne({ where: { id: decryptedId } });

    // Check if resend limit has been reached
    if (user.resendCount >= MAX_RESEND_COUNT) {
      return res.status(400).send({ error: "Resend limit reached" });
    }

    // Increment the resend count
    await User.update(
      { resendCount: user.resendCount + 1 },
      { where: { id: decryptedId } }
    );

    // Generate new encrypted serial
    const code = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
    const encryptedCode = encrypter.encrypt(code.toString());

    // Update user's encrypted serial
    await User.update({ otp: encryptedCode }, { where: { id: decryptedId } });

    // Send the new code via SMS
    require("dotenv").config();
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require("twilio")(accountSid, authToken);

    const message = await client.messages.create({
      body: `Stock: Your OTP code is: ${code}, please do not share with anyone else`,
      from: "++14346867271",
      to: user.phoneNumber,
    });

    if (message.status === "queued" || message.status === "sent") {
      await User.update(
        { wasSmsSent: true },
        { where: { id: decryptedId } }
      );
      return res.status(200).send({ success: "SMS sent" });
    } else {
      await User.update({ wasSmsSent: false }, { where: { id: decryptedId } });
      return res.status(500).send({ error: "SMS not sent" });
    }
  } catch (err) {
    console.log(err.message)
    return res.status(500).send({ message: err.message });
  }
};

//create stock
exports.createStock = async (req, res) => {
  try {
    const decryptedId = encrypter.dencrypt(req.body.userId);
    const user = await User.findOne({ where: { id: decryptedId } });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const newStocks = req.body.stocks.map((stock) => {
      return {
        name: stock.name,
        value: stock.value,
        amount: stock.amount,
        userId: user.id
      };
    });

    const stocks = await Stock.bulkCreate(newStocks);

    // Create the bill
    const bill = await Bill.create({
      earn: 0,
      toPay: 0,
      paid: false,
      end: false,
      toPayTotal: 0,
      userId: user.id
    });

    return res.status(200).send({ stocks, bill });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

//get all stock
exports.getAllStocks = async (req, res) => {
  try {
    const decryptedId = encrypter.dencrypt(req.params.userId);
    const user = await User.findOne({ where: { id: decryptedId } });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const stocks = await Stock.findAll({ where: { userId: user.id } });

    return res.status(200).send({ stocks });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// update stock
exports.updateStock = async (req, res) => {
 
  try {
    const decryptedId = encrypter.dencrypt(req.params.userId);
    const user = await User.findOne({ where: { id: decryptedId } });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const { id } = req.params;
    const { action, quantity } = req.body;

    const stock = await Stock.findOne({ where: { id: id, userId: user.id } });

    if (!stock) {
      return res.status(400).send({ error: "Invalid stock ID" });
    }

    if (action === 'add') {
      stock.amount += quantity;
    } else if (action === 'subtract') {
      if (stock.amount - quantity < 0) {
        return res.status(400).send({ error: "Stock amount can't be less than 0" });
      }
      stock.amount -= quantity;
      const bill = await Bill.findOne({ where: { userId: user.id } });
      bill.toPayTotal += (stock.value * quantity);
      await bill.save();
    } else {
      return res.status(400).send({ error: "Invalid action" });
    }

    await stock.save();

    return res.status(200).send({ message: "Stock updated successfully" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

exports.getBill = async (req, res) => {
  try {
    const decryptedId = encrypter.dencrypt(req.params.userId);
    const user = await User.findOne({ where: { id: decryptedId } });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const bill = await Bill.findOne({ where: { userId: user.id, paid: false } });

    return res.status(200).send({ bill });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

exports.markAsDelivered = async (req, res) => {
  try {
    const decryptedId = encrypter.dencrypt(req.params.userId);
    const userId = decryptedId;
    const bill = await Bill.findOne({ where: { userId, paid: false } });

    if (!bill) {
      return res.status(404).send({ error: "Bill not found" });
    }

    bill.earn += 10;
    bill.toPay += 0.25;
    bill.toPayTotal -= 10;
    await bill.save();

    return res.status(200).send({ message: "Bill marked as delivered successfully" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

exports.closeBill = async (req, res) => {
  try {
    const decryptedId = encrypter.dencrypt(req.params.userId);
    const action = req.body.action;
    
    if (action !== 'close') {
      return res.status(400).send({ error: "Invalid action" });
    }

    const bill = await Bill.findOne({ where: { userId: decryptedId } });

    if (!bill) {
      return res.status(404).send({ error: "Bill not found" });
    }

    bill.end = true;
    await bill.save();

    return res.status(200).send({ message: "Bill closed" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};