import { Hono } from "hono";
import { GetAllUom, PostUom, PutUom } from "../controllers/uom.controller.js";


export const uomRoute = new Hono();

uomRoute.get('', GetAllUom);
uomRoute.post('', PostUom);
uomRoute.put('', PutUom);