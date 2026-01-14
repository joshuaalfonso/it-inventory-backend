import sql  from 'mssql';
import type { Context } from "hono";
import { poolPromise } from '../config/db.js';
import { AprrovePurchaseOrderModel, CreatePurchaseOrderItemModel, CreatePurchaseOrderModel, UpdatePurchaseOrderItemModel, UpdatePurchaseOrderModel } from '../models/purchase-order.model.js';

const tableName = 'purchase_order';

export const GetPurchaseOrderController = async (c: Context) => {

    try {
        const pool = await poolPromise;
        const result = await pool
            .request()
            .query(`
                SELECT
                    po.*,
                    COALESCE(t.total_delivered_quantity, 0) AS total_delivered
                FROM 
                    purchase_order po
                LEFT JOIN (
                    SELECT
                        i.purchase_order_id,
                        SUM(ii.received_quantity) AS total_delivered_quantity
                    FROM 
                        incoming i
                    LEFT JOIN 
                        incoming_item ii
                    ON 
                        i.incoming_id = ii.incoming_id
                    GROUP BY 
                        i.purchase_order_id
                ) t
                ON 
                    po.purchase_order_id = t.purchase_order_id
                ORDER BY 
                    po.created_at DESC;

            `);

        return c.json(result.recordset);
    }

    catch(error) {
        const message = 'Failed to load purchase order.';
        console.error(message, error);
        return c.json({ message: message }, 500);
    }

} 


export const GetPurchaseOrderByIDController = async (c: Context) => {

    const id = c.req.param('purchase_order_id');

    if (!id) {
        return c.json({
            message: "The 'purchase_order_id' parameter must be provided."
        }, 400);
    }

    try {

        const pool = await poolPromise;
        const result = await pool
            .request()
            .input('purchase_order_id', id)
            .query(`
                SELECT 
                    po.purchase_order_id,
                    po.purchase_order_number, 
                    po.purchase_order_date, 
                    po.purchase_requisition_number, 
                    po.delivery_date, 
                    po.total_quantity, 
                    po.status,
                    po.created_at,
                    poi.purchase_order_item_id,
                    poi.item_id,
                    poi.employee_id,
                    poi.ordered_quantity,
                    COALESCE(ii.delivered_quantity, 0) AS delivered_quantity,
                    SUM(COALESCE(ii.delivered_quantity, 0))
                    OVER (PARTITION BY po.purchase_order_id) AS total_delivered,
                    poi.price,
                    i.item_name,
                    i.image_name,
                    b.brand_id,
                    b.brand_name,
                    c.category_id,
                    c.category_name,
                    it.item_type_name,
                    u.uom_name,
                    e.employee_name
                FROM 
                    ${tableName} po 
                INNER JOIN
                    purchase_order_item poi 
                ON
                    po.purchase_order_id = poi.purchase_order_id
                LEFT JOIN (
                    SELECT
                        purchase_order_item_id,
                        SUM(received_quantity) AS delivered_quantity
                    FROM 
                        incoming_item
                    GROUP BY 
                        purchase_order_item_id
                ) ii
                ON poi.purchase_order_item_id = ii.purchase_order_item_id

                LEFT JOIN
                    item i
                ON
                    poi.item_id = i.item_id
                LEFT JOIN
                    brand b
                ON
                    i.brand_id = b.brand_id
                LEFT JOIN
                    category c
                ON
                    i.category_id = c.category_id
                LEFT JOIN
                    item_type it
                ON
                    i.item_type_id = it.item_type_id
                LEFT JOIN
                    uom u
                ON
                    i.uom_id = u.uom_id
                LEFT JOIN
                    employee e
                ON
                    poi.employee_id = e.employee_id
                WHERE 
                    po.purchase_order_id = @purchase_order_id AND poi.is_del = 0
                ORDER BY 
                    po.created_at DESC
                
            `)
        
        const rows = result.recordset;

        // Group items by PO
        const purchaseOrder: any = {}

        for (const row of rows) {
            if (!purchaseOrder[row.purchase_order_id]) {
                purchaseOrder[row.purchase_order_id] = {
                    purchase_order_id: row.purchase_order_id,
                    purchase_order_number: row.purchase_order_number,
                    purchase_order_date: row.purchase_order_date,
                    purchase_requisition_number: row.purchase_requisition_number,
                    delivery_date: row.delivery_date,
                    total_quantity: row.total_quantity,
                    total_delivered: row.total_delivered,
                    status: row.status,
                    created_at: row.created_at,
                    purchase_order_item: []
                }
            }

            purchaseOrder[row.purchase_order_id].purchase_order_item.push({
                purchase_order_item_id: row.purchase_order_item_id,
                purchase_order_id: row.purchase_order_id,
                item_id: row.item_id,
                item_name: row.item_name,
                image_name: row.image_name,
                brand_name: row.brand_name,
                category_name: row.category_name,
                item_type_name: row.item_type_name,
                uom_name: row.uom_name,
                employee_id: row.employee_id,
                employee_name: row.employee_name,
                ordered_quantity: row.ordered_quantity,
                delivered_quantity: row.delivered_quantity,
                price: row.price
            })
        }

        return c.json(Object.values(purchaseOrder)[0] || null)
        
    } 

    catch (err) {
        return c.json({ 
            error: 'Failed to load purchase order', 
            details: err 
        }, 500)
    }

    // return c.json({id})

}

export const CreatePurchaseOrderController = async (c: Context) => {

    const body = await c.req.json(); 

    const {
        purchase_order_date,
        purchase_order_number,
        purchase_requisition_number,
        delivery_date,
        total_quantity,
        purchase_order_item
    } = body;

    const required = [
        purchase_order_date,
        purchase_order_number,
        purchase_requisition_number,
        delivery_date,
        total_quantity,
        purchase_order_item
    ];

    if (required.some(v => !v)) {
        return c.json({
            success: false,
            message: "All fields are required."
        }, 400);
    }


    let pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // insert po header
        const headerResult = await CreatePurchaseOrderModel(
            purchase_order_date, 
            purchase_order_number, 
            purchase_requisition_number, 
            delivery_date, 
            total_quantity,
            transaction
        );

        const headerInsertedData = headerResult.recordset[0] || [];

        // insert po items
        for (const item of body.purchase_order_item) {
            await CreatePurchaseOrderItemModel(
                headerInsertedData.purchase_order_id,
                item.item_id,
                item.employee_id,
                item.ordered_quantity,
                item.price,
                transaction
            )
        }

        await transaction.commit();

        return c.json({
            success: true,
            message: 'Purchase order created successfully',
            data: headerInsertedData
        })

    } 

    catch (err) {
        console.error("error", err)
        await transaction.rollback()
        return c.json({ 
            success: false,
            message: 'Failed to create purchase order.', 
            details: err 
        }, 500)
    }


};


export const UpdatePurchaseOrderController = async (c: Context) => {

    const body = await c.req.json(); 

    const {
        purchase_order_id,
        purchase_order_date,
        purchase_order_number,
        purchase_requisition_number,
        delivery_date,
        total_quantity,
        purchase_order_item
    } = body;

    const required = [
        purchase_order_id,
        purchase_order_date,
        purchase_order_number,
        purchase_requisition_number,
        delivery_date,
        total_quantity,
        purchase_order_item
    ];

    if (required.some(v => !v)) {
        return c.json({
            success: false,
            message: "All fields are required."
        }, 400);
    }

    let pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {

        await transaction.begin();

        // update po header
        const headerResult = await UpdatePurchaseOrderModel(
            purchase_order_id,
            purchase_order_date, 
            purchase_order_number, 
            purchase_requisition_number, 
            delivery_date, 
            total_quantity,
            transaction
        );

        // 2️⃣ Get existing item IDs from DB
        const existingItemsResult = await pool
        .request()
        .input('purchase_order_id', purchase_order_id)
        .query(`
            SELECT 
                purchase_order_item_id
            FROM 
                purchase_order_item
            WHERE 
                purchase_order_id = @purchase_order_id
            AND is_del = 0
        `)

        // 3️⃣ Process each item in request
        const requestItemIds: number[] = []

        const existingItemIds = existingItemsResult.recordset.map(r => r.purchase_order_item_id)

        for (const item of purchase_order_item) {
            if (item.purchase_order_item_id) {
                await UpdatePurchaseOrderItemModel(
                    item.purchase_order_item_id,
                    item.item_id,
                    item.employee_id,
                    item.ordered_quantity,
                    item.price,
                    transaction
                )
                requestItemIds.push(item.purchase_order_item_id)
            } else {
                await CreatePurchaseOrderItemModel(
                    purchase_order_id,
                    item.item_id,
                    item.employee_id,
                    item.ordered_quantity,
                    item.price,
                    transaction
                )
            }

        }

        // 4️⃣ Soft-delete items not present in request
        const itemsToDelete = existingItemIds.filter(id => !requestItemIds.includes(id));
        if (itemsToDelete.length > 0) {
            const idsParam = itemsToDelete.join(',') 
            await pool.
            request()
            .query(`
                UPDATE 
                    purchase_order_item
                SET 
                    is_del = 1
                WHERE 
                    purchase_order_item_id IN (${idsParam})
            `)
        }

        await transaction.commit();

        // const headerUpdatedData = headerResult.recordset[0] || [];

        return c.json({
            success: true,
            message: 'Successfully updated.',
            data: headerResult
        })

    } 

    catch (error) {
        console.error("error", error)
        await transaction.rollback()
        return c.json({ 
            success: false,
            message: 'Failed to update purchase order.', 
            details: error 
        }, 500)
    }


}


export const ApprovePurchaseOrderController = async (c: Context) => {

    const id = c.req.param('purchase_order_id');

    if (!id) {
        return c.json({
            message: "ID parameter must be provided."
        }, 400);
    }

    const idNumber = Number(id);

    try {

        await AprrovePurchaseOrderModel(idNumber);

        return c.json({ 
            success: true,
            message: 'Successfully aprroved.', 
        })

    }

    catch (error) {
        console.error("error", error)
        return c.json({ 
            success: false,
            message: 'Failed to approve purchase order.', 
            details: error 
        }, 500)
    }

}