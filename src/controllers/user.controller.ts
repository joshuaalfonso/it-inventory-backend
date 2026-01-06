import bcrypt from "bcryptjs";
import type { Context } from "hono";
import { CreateUserModel } from "../models/user.model.js";
import { poolPromise } from "../config/db.js";
import { generateToken } from "../helpers/jwt.js";


export const CreateUserController = async (c: Context) => {

    try {

        const { username, password, first_name, last_name, email } = await c.req.json();

        if (!username || !password || !email || !first_name || !last_name) {
            return c.json({ message: "Missing field is required." }, 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            username,
            hashedPassword,
            first_name,
            last_name,
            email
        }

        await CreateUserModel(newUser);

        return c.json({success: true, message: 'Successfully created.'});

    }

    catch (err) {
        console.error(err);
        return c.json({ message: "Server error" }, 500);
    }

}

export const UserLoginController = async (c: Context) => {

    const { username, password } = await c.req.json();

    if (!username || !password) {
       return c.json({ success: false, message: "Missing field is required." }, 400);
    }

    try {

        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("username", username)
            .query("SELECT * FROM users WHERE username = @username");

        const user = result.recordset[0];

        if (!user) {
            return c.json({ success: false, message: "User not found" }, 404);
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return c.json({ success: false, message: "Invalid password" }, 401);
        }

        const token = generateToken(user);

        const userData = {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
        }

        return c.json({ 
            success: true,
            message: 'Successfully logged in.',
            user: userData,
            token 
        });

    }

    catch (err) {
        console.error(err);
        return c.json({ success: false, message: "Server error" }, 500);
    }

}