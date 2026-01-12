import { Hono } from "hono";
import { CreateIncomingController, GetIncomingByID, GetIncomingController } from "../controllers/incoming.controller.js";






export const incomingRoute = new Hono();

incomingRoute.get('', GetIncomingController);
incomingRoute.get('/:incoming_id', GetIncomingByID);

incomingRoute.post('', CreateIncomingController);
