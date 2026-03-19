require("dotenv").config();
const app = require("./src/app.js");
const connectToDB = require("./src/config/db.js");
const invokeGeminiAi = require("./src/services/ai.service.js");

connectToDB();
invokeGeminiAi();

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});