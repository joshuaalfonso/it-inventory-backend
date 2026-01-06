import { poolPromise } from "../config/db.js"

export interface UserList {
    user_id: number
    username: string
    hashedPassword: string
    email: string
    first_name: string
    last_name: string
}

export interface UserPost {
    username: string
    hashedPassword: string
    email: string
    first_name: string
    last_name: string
}


export const CreateUserModel = async ( newUser: UserPost ) => {

    const pool = await poolPromise;

    await pool
      .request()
      .input("username", newUser.username)
      .input("password", newUser.hashedPassword)
      .input("first_name", newUser.first_name)
      .input("last_name", newUser.last_name)
      .input("email", newUser.email)
      .query(
        `INSERT INTO 
            users (username, password, first_name, last_name, email)
         VALUES 
            (@username, @password, @first_name, @last_name, @email)`
        );

}