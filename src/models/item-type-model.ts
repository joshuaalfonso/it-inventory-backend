import { poolPromise } from "../config/db.js"





const TABLE_NAME = 'item_type';

interface ItemTypePost {
    item_type_id: number,
    item_type_name: string,
    created_at: string
}

export const AllItemType = async () => {

    const pool = await poolPromise;

    const request = await pool
    .request()
    .query(`
        SELECT 
            *
        FROM
            ${TABLE_NAME}
    `)

    return request.recordset

}

export const FindItemByName = async ( item_type_name: string ) => {

    const pool =  await poolPromise;

    const request = await pool
    .request()
    .input('item_type_name', item_type_name)
    .query(`
        SELECT 
            *
        FROM 
            ${TABLE_NAME}
        WHERE 
            item_type_name = @item_type_name
    `)

    return request.recordset.length > 0 ? request.recordset[0] : null; 

}

export const InsertItemType = async ( newItemType: ItemTypePost ) => {

    const pool = await poolPromise;

    const result = await pool
    .request()
    .input('item_type_name', newItemType.item_type_name)
    .query(`
        INSERT INTO
            ${TABLE_NAME} (item_type_name)
        OUTPUT INSERTED.* 
        VALUES 
            (@item_type_name)
        
    `)

    return result.recordset[0];

}

export const UpdateItemType = async ( newItemType: ItemTypePost) => {

    const pool = await poolPromise;

    const result = await pool
    .request()
    .input('item_type_id', newItemType.item_type_id)
    .input('item_type_name', newItemType.item_type_name)
    .query(`
        UPDATE 
            ${TABLE_NAME} 
        SET 
            item_type_name = @item_type_name
        OUTPUT INSERTED.* 
        WHERE 
            item_type_id = @item_type_id
    `)

    return result.recordset[0];

}