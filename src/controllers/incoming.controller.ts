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
                    i.sample_code,
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

export const GetIncomingByID = async (c: Context) => {

    const id = c.req.param("incoming_id");

    if (!id) {
        return c.json({
            message: "Missing parameter is required."
        }, 400);
    }

    try {

        const pool = await poolPromise;

        const headerResult = await pool.request()
        .input("incoming_id", sql.Int, id)
        .query(`
            SELECT 
                i.incoming_id,
                i.purchase_order_id,
                po.purchase_order_number,
                i.incoming_date,
                i.sample_code,
                i.total_quantity,
                i.remarks,
                i.created_at
            FROM 
                ${tableName} i
            LEFT JOIN
                purchase_order po
            ON
                i.purchase_order_id = po.purchase_order_id
            WHERE incoming_id = @incoming_id
        `);

        if (headerResult.recordset.length === 0) {
            return c.json({ message: "Incoming not found" }, 404)
        }

        const itemsResult = await pool.request()
        .input("incoming_id", sql.Int, id)
        .query(`
            SELECT 
                it.incoming_item_id,
                it.incoming_id,
                it.purchase_order_item_id,
                i.purchase_order_id,
                item.item_id,
                item.item_name,
                item.image_name,
                b.brand_name,
                c.category_name,
                item_type.item_type_name,
                uom.uom_name,
                it.received_quantity,
                it.created_at
            FROM 
                incoming_item it
            INNER JOIN
                incoming i 
            ON
                it.incoming_id = i.incoming_id 
            LEFT JOIN
                item 
            ON
                it.item_id = item.item_id
            LEFT JOIN
                brand b
            ON
                item.brand_id = b.brand_id
            LEFT JOIN
                category c
            ON
                item.category_id = c.category_id
            LEFT JOIN
                item_type 
            ON
                item.item_type_id = item_type.item_type_id
            LEFT JOIN
                uom 
            ON
                item.uom_id = uom.uom_id
            WHERE 
                it.incoming_id = @incoming_id
        `)

        return c.json({
            ...headerResult.recordset[0],
            incoming_item: itemsResult.recordset
        })

    }

    catch (error) {
        return c.json({ 
            message: 'Failed to load incoming', 
            details: error 
        }, 500)
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

    const year = new Date().getFullYear()

    try {
        await transaction.begin();

        const lastRecordResult = await new sql.Request(transaction)
        .query(`
            SELECT 
                TOP 1 sample_code
            FROM 
                incoming
            WHERE 
                sample_code LIKE 'INC-${year}-%'
            ORDER BY 
                incoming_id DESC
        `)

        let nextNumber = 1

        if (lastRecordResult.recordset.length > 0) {
            const lastCode = lastRecordResult.recordset[0].sample_code 
            nextNumber = Number(lastCode.split('-')[2]) + 1
        }

        const sample_code = `INC-${year}-${String(nextNumber).padStart(4, '0')}`;
        console.log(sample_code)

        const headerResult = await new sql.Request(transaction)
        .input('purchase_order_id', sql.Int, purchase_order_id)
        .input('incoming_date', sql.Date, incoming_date)
        .input('sample_code', sql.VarChar, sample_code)
        .input('total_quantity', sql.Int, total_quantity)
        .input('remarks', sql.NVarChar, remarks)
        .query(`     
            INSERT INTO 
                incoming 
                (purchase_order_id, incoming_date, sample_code, total_quantity, remarks)
            OUTPUT 
                INSERTED.*
            VALUES 
                (@purchase_order_id, @incoming_date, @sample_code, @total_quantity, @remarks)
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
                i.sample_code,
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