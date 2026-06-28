import { Router } from "express";
import * as authController from "../controllers/auth.controllers.js";

const authRouter = Router()


//POST /api/auth/register
authRouter.post("/register", authController.register);

//GET /api/auth/login
authRouter.post("/login",authController.login)

//GET /api/auth/get-me
authRouter.get("/getMe",authController.getMe)

//GET/api/auth/refresh-token
authRouter.get("/refresh-token",authController.refreshToken)

//GET /api/auth/logout
authRouter.get("/logout",authController.logout)

//GET /api/auth/logoutAll
authRouter.get("/logoutAll",authController.logoutAll)

//GET /api/auth/Email-verify
authRouter.get("/email-verify",authController.verifyEmail)


export default authRouter