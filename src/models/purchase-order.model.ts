import { poolPromise } from "../config/db.js";
import sql  from 'mssql';

const tableName: string = 'purchase-order';

// export const AllBrands = async () => {
//     const pool = await poolPromise;
//     const result = await pool
//       .request()
//       .query(`SELECT * FROM ${tableName} ORDER BY created_at DESC`);
//     return result.recordset;
// }


// export const BrandByID = async (brand_id: number) => {
//     const pool = await poolPromise;
//     const result = await pool
//     .request()
//     .query(`SELECT * FROM ${tableName} WHERE brand_id = $${brand_id}`);
//     return result.recordset;
// }


export const CreatePurchaseOrderModel = async (
    purchase_order_date: string,
    purchase_order_number: string,
    purchase_requisition_number: string,
    delivery_date: string,
    total_quantity: number,
    transaction: any
) => {

    const result = new sql.Request(transaction)
    .input('purchase_order_date', sql.Date, purchase_order_date)
    .input('purchase_order_number', sql.NVarChar, purchase_order_number)
    .input('purchase_requisition_number', sql.NVarChar, purchase_requisition_number)
    .input('delivery_date', sql.Date, delivery_date)
    .input('total_quantity', sql.Int, total_quantity)
    .query(`
        INSERT INTO 
            purchase_order 
            (purchase_order_date, purchase_order_number, purchase_requisition_number, delivery_date, total_quantity)
        OUTPUT INSERTED.*
        VALUES 
            (@purchase_order_date, @purchase_order_number, @purchase_requisition_number, @delivery_date, @total_quantity)
    `);

    return result;

}


export const UpdatePurchaseOrderModel = async (
    purchase_order_id: number,
    purchase_order_date: string,
    purchase_order_number: string,
    purchase_requisition_number: string,
    delivery_date: string,
    total_quantity: number,
    transaction: any
) => {

    const result = await new sql.Request(transaction)
        .input('purchase_order_id', sql.Int, purchase_order_id)
        .input('purchase_order_date', sql.Date, purchase_order_date)
        .input('purchase_order_number', sql.NVarChar, purchase_order_number)
        .input('purchase_requisition_number', sql.NVarChar, purchase_requisition_number)
        .input('delivery_date', sql.Date, delivery_date)
        .input('total_quantity', sql.Int, total_quantity)
        .query(`
            UPDATE 
                purchase_order
            SET
                purchase_order_date = @purchase_order_date,
                purchase_order_number = @purchase_order_number,
                purchase_requisition_number = @purchase_requisition_number,
                delivery_date = @delivery_date,
                total_quantity = @total_quantity
            OUTPUT INSERTED.*
            WHERE 
                purchase_order_id = @purchase_order_id
        `)

    return result.recordset[0]
    
}

export const CreatePurchaseOrderItemModel = async (
    purchase_order_id: number, 
    item_id: number, 
    employee_id: number, 
    ordered_quantity: number, 
    price: number, 
    transaction: any
) => {
    const itemRequest = new sql.Request(transaction)
    await itemRequest
    .input('purchase_order_id', sql.Int, purchase_order_id)
    .input('item_id', sql.Int, item_id)
    .input('employee_id', sql.Int, employee_id)
    .input('ordered_quantity', sql.Int, ordered_quantity)
    .input('price', sql.Decimal(18, 2), price)
    .query(`
        INSERT INTO 
            purchase_order_item 
            (purchase_order_id, item_id, employee_id, ordered_quantity, price)
        VALUES 
            (@purchase_order_id, @item_id, @employee_id, @ordered_quantity, @price)
    `)
}

export const UpdatePurchaseOrderItemModel = async (
    purchase_order_item_id: number,
    item_id: number,
    employee_id: number,
    ordered_quantity: number,
    price: number,
    transaction: any
) => {
        const result = await new sql.Request(transaction)
        .input('purchase_order_item_id', sql.Int, purchase_order_item_id)
        .input('item_id', sql.Int, item_id)
        .input('employee_id', sql.Int, employee_id)
        .input('ordered_quantity', sql.Int, ordered_quantity)
        .input('price', sql.Int, price)
        .query(`
            UPDATE 
                purchase_order_item
            SET
                item_id = @item_id,
                employee_id = @employee_id,
                ordered_quantity = @ordered_quantity,
                price = @price
            WHERE 
                purchase_order_item_id = @purchase_order_item_id

        `)

    return result
}



export const SoftDeletePurchaseOrderModel = async (
    purchase_order_id: number,
    transaction: any
) => {
    return await new sql.Request(transaction)
        .input('purchase_order_id', sql.Int, purchase_order_id)
        .query(`
            UPDATE purchase_order
            SET is_del = 1
            WHERE purchase_order_id = @purchase_order_id
        `);
};

export const AprrovePurchaseOrderModel = async (purchase_order_id: number) => {
        const pool = await poolPromise;

        const result = await pool
        .request()
        .input('purchase_order_id', sql.Int, purchase_order_id)
        .query(`
            UPDATE purchase_order
            SET status = 1
            WHERE purchase_order_id = @purchase_order_id
        `);

        return result
        
};
