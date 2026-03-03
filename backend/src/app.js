const express = require("express");
const authRouter = require("./routes/auth.route.js");

const app = express();


app.use(express.json());


// Using all the auth routes here
app.use("/api/auth", authRouter);


module.exports = app;