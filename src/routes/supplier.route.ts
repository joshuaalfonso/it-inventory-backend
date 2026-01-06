import { Hono } from "hono";
import { GetSupplier, PostSupplier, PutSupplier } from "../controllers/supplier.controller.js";





export const supplierRoute = new Hono();

supplierRoute.get('', GetSupplier);
supplierRoute.post('', PostSupplier);
supplierRoute.put('', PutSupplier);
