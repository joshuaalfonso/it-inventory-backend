import { Hono } from "hono";
import { ApprovePurchaseOrderController, CreatePurchaseOrderController, GetPurchaseOrderByIDController, GetPurchaseOrderController, UpdatePurchaseOrderController } from "../controllers/purchase-order.controller.js";




export const purchaseOrderRoute = new Hono();

purchaseOrderRoute.get('', GetPurchaseOrderController);
purchaseOrderRoute.get('/:purchase_order_id', GetPurchaseOrderByIDController);
purchaseOrderRoute.post('', CreatePurchaseOrderController);
purchaseOrderRoute.put('', UpdatePurchaseOrderController);
purchaseOrderRoute.put('/approve/:purchase_order_id', ApprovePurchaseOrderController);
