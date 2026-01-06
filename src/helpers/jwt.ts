import jwt from "jsonwebtoken";
import 'dotenv/config';
import type { UserList } from "../models/user.model.js";


export const generateToken = (user: UserList) => {

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }

    return jwt.sign(
        { 
            user_id: user.user_id, 
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name 
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
        
    );

};

export const verifyToken = (token: string) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }

    return jwt.verify(token, process.env.JWT_SECRET);
};
