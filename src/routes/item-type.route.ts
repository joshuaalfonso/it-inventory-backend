import { Hono } from "hono";
import { GetItemType, PostItemType, PutItemType } from "../controllers/item-type.controller.js";







export const itemTypeRoute = new Hono();

itemTypeRoute.get('', GetItemType);
itemTypeRoute.post('', PostItemType);
itemTypeRoute.put('', PutItemType);
