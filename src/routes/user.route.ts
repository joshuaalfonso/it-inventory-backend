import { Hono } from "hono";
import { CreateUserController, UserLoginController } from "../controllers/user.controller.js";



export const userRoute = new Hono();

userRoute.post('', CreateUserController);
userRoute.post('/login', UserLoginController);


