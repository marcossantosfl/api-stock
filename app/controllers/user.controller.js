const db = require("../models");
const config = require("../config/auth.config");
const { Encrypter } = require("../middleware/crypto");

const encrypter = new Encrypter();