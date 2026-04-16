const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");


const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// CORS (only for local dev)
if (process.env.NODE_ENV === "development") {
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );
}


/* require all the routes here */
const authRouter = require("./routes/auth.route.js");
const interviewRouter = require("./routes/interview.route.js");


/* using all the routes here */
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);


// Serving Frontend
const frontendPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendPath));

// Universal fallback (Express v5 safe)
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});


module.exports = app;