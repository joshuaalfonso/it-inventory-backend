import { Hono } from "hono";
import { CreateBrand, GetAllBrands, GetBrandByID, PutBrand } from "../controllers/brands.controller.js";


export const brandRoute = new Hono();

brandRoute.get('', GetAllBrands);
brandRoute.get('/:id', GetBrandByID);
brandRoute.post('', CreateBrand);
brandRoute.put('', PutBrand);




