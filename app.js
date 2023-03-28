// Import required modules
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// Configure CORS options
const corsOptions = {
  origin: [
    "http://localhost:4200",
    "http://localhost:3000",
    "https://urchin-app-s8tif.ondigitalocean.app",
  ],
};

// Apply middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Error handling middleware for JSON parsing issues
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error(err);
    return res.sendStatus(400); // Bad request
  }

  next();
});

// Database setup
const db = require("./app/models");
const Role = db.role;

db.sequelize.sync();

// Routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

// Set port, listen for requests
app.listen(8080, () => {
  console.log(`Server is running on port ${8080}.`);
});

// Function to create initial roles
function initial() {
  Role.create({
    id: 1,
    name: "user",
  });

  Role.create({
    id: 2,
    name: "moderator",
  });

  Role.create({
    id: 3,
    name: "admin",
  });
}

initial();