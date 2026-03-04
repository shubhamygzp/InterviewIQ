const {Router} = require("express");
const authController = require("../controllers/auth.controller.js");

const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @descrption Register a new user
 * @access Public
 */
authRouter.post("/register", authController.registerUserController);


/**
 * @route POST /api/auth/login
 * @description login user with email and password
 * @access Public
 */
authRouter.post("/login", authController.loginUserController);

module.exports = authRouter;