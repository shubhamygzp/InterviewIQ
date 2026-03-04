const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth.route.js");

const app = express();


app.use(express.json());
app.use(cookieParser());


// Using all the auth routes here
app.use("/api/auth", authRouter);


module.exports = app;