import sql  from 'mssql';
import type { Context } from "hono";
import { poolPromise } from "../config/db.js";


const tableName = 'incoming';

export const GetIncomingController = async (c: Context) => {

   try {
        const pool = await poolPromise;
        const result = await pool
            .request()
            .query(`
                SELECT 
                    i.incoming_id,
                    i.purchase_order_id,
                    po.purchase_order_number,
                    i.incoming_date,
                    i.total_quantity,
                    i.remarks,
                    i.created_at
                FROM 
                    ${tableName} i
                LEFT JOIN
                    purchase_order po
                ON
                     i.purchase_order_id = po.purchase_order_id
                ORDER BY
                    i.created_at DESC
              
            `);

        return c.json(result.recordset);
    }

    catch(error) {
        const message = 'Failed to load incoming.';
        console.error(message, error);
        return c.json({ message: message }, 500);
    }


}


export const CreateIncomingController = async (c: Context) => {

    const body = await c.req.json(); 

    const {
        incoming_date,
        purchase_order_id,
        remarks,
        total_quantity,
    } = body;

    const required = [
        incoming_date,
        purchase_order_id,
        total_quantity,
    ];

    if (required.some(v => !v)) {
        return c.json({
            success: false,
            message: "Missing field is required."
        }, 400);
    }

    let pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const headerResult = await new sql.Request(transaction)
        .input('purchase_order_id', sql.Int, purchase_order_id)
        .input('incoming_date', sql.Date, incoming_date)
        .input('total_quantity', sql.Int, total_quantity)
        .input('remarks', sql.NVarChar, remarks)
        .query(`     
            INSERT INTO 
                incoming 
                (purchase_order_id, incoming_date, total_quantity, remarks)
            OUTPUT 
                INSERTED.*
            VALUES 
                (@purchase_order_id, @incoming_date, @total_quantity, @remarks)
        `);

        const headerInsertedData = headerResult.recordset[0] || [];

        const responseData = await new sql.Request(transaction)
        .input('incoming_id', sql.Int, headerInsertedData.incoming_id)
        .query(`
            SELECT 
                i.incoming_id,
                i.purchase_order_id,
                po.purchase_order_number,
                i.incoming_date,
                i.total_quantity,
                i.remarks,
                i.created_at
            FROM 
                ${tableName} i
            LEFT JOIN
                purchase_order po
            ON
                i.purchase_order_id = po.purchase_order_id
            WHERE
                i.incoming_id = @incoming_id
            ORDER BY
                i.created_at DESC
        `)

        for (const item of body.incoming_item) {
            await new sql.Request(transaction)
            .input('incoming_id', sql.Int, headerInsertedData.incoming_id)
            .input('purchase_order_item_id', sql.Int, item.purchase_order_item_id)
            .input('item_id', sql.Int, item.item_id)
            .input('received_quantity', sql.Int, item.received_quantity)
            .query(`
                INSERT INTO 
                    incoming_item 
                    (incoming_id, purchase_order_item_id, item_id, received_quantity)
                VALUES 
                    (@incoming_id, @purchase_order_item_id, @item_id, @received_quantity)
            `)
        }

        await transaction.commit();

        return c.json({ 
            success: true, 
            message: 'success',
            data: responseData.recordset[0]
        });

    }

    catch (error) {
        console.error("error", error)
        await transaction.rollback()
        return c.json({ 
            success: false,
            message: 'Failed to create incoming.', 
            details: error ,
        }, 500)
    }


}