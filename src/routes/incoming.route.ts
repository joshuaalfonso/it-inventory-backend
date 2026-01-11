import { Hono } from "hono";
import { CreateIncomingController, GetIncomingController } from "../controllers/incoming.controller.js";






export const incomingRoute = new Hono();

incomingRoute.get('', GetIncomingController);
incomingRoute.post('', CreateIncomingController);
