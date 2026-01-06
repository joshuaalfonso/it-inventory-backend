import { Hono } from "hono";
import { GetItemByID, GetItems, PostItems, PutItems } from "../controllers/items.controller.js";


export const itemsRoute = new Hono();

itemsRoute.get('', GetItems);
itemsRoute.get('/:item_id', GetItemByID)
itemsRoute.post('', PostItems);
itemsRoute.put('', PutItems);