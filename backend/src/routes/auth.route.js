const {Router} = require("express");
const authController = require("../controllers/auth.controller.js");

const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @descrption Register a new user
 * @access Public
 */
authRouter.post("/register", authController.registerUserController);

module.exports = authRouter;