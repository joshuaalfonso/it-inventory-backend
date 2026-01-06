import { Hono } from "hono";
import { GetAllCategories, PostCategory, PutCategory } from "../controllers/categories.controller.js";


export const categoriesRoute = new Hono();

categoriesRoute.get('', GetAllCategories);
categoriesRoute.post('', PostCategory);
categoriesRoute.put('', PutCategory);