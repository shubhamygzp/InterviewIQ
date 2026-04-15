const mongoose = require("mongoose");

async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to Database");
  } 
  catch (error) {
    console.log("Database connection failed:", error.message);
    process.exit(1); // Stop the server if DB connection fails
  }
}

module.exports = connectToDB;
