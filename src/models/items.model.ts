import { poolPromise } from "../config/db.js"


const tableName = 'item';

export interface ItemPost {
    item_id: number,
    item_name: string,
    brand_id: number,
    category_id: number,
    item_type_id: number,
    uom_id: number,
    current_price: number
    image_name: string | null
}

export const AllItems = async () => {

    const pool = await poolPromise;

    const request = await pool
    .request()
    .query(`
        SELECT 
            item.item_id,
            item.item_name,
            item.item_model,
            item.brand_id,
            b.brand_name,
            item.category_id,
            c.category_name,
            item.item_type_id,
            it.item_type_name,
            item.uom_id,
            u.uom_name,
            item.current_price,
            item.image_name
        FROM 
            item 
        LEFT JOIN 
            brand as b
        ON 
            item.brand_id = b.brand_id
        LEFT JOIN
            category as c
        ON 
            item.category_id = c.category_id
        LEFT JOIN
            item_type it
        ON 
            item.item_type_id = it.item_type_id
        LEFT JOIN 
            uom as u
        ON 
            item.uom_id = u.uom_id
        ORDER BY
            item.created_at DESC

    `)

    return request.recordset

}


export const ItemByID = async (item_id: number) => {

    const pool = await poolPromise;

    const request = await pool
    .request()
    .input('item_id', item_id) 
    .query(`
        SELECT 
            item.item_id,
            item.item_name,
            item.item_model,
            item.brand_id,
            b.brand_name,
            item.category_id,
            c.category_name,
            item.item_type_id,
            it.item_type_name,
            item.uom_id,
            u.uom_name,
            item.current_price,
            item.image_name
        FROM 
            item 
        LEFT JOIN 
            brand as b
        ON 
            item.brand_id = b.brand_id
        LEFT JOIN
            category as c
        ON 
            item.category_id = c.category_id
        LEFT JOIN
            item_type it
        ON 
            item.item_type_id = it.item_type_id
        LEFT JOIN 
            uom as u
        ON 
            item.uom_id = u.uom_id
        WHERE 
            item_id = ${item_id}

    `)

    return request.recordset[0]

}


export const NewItem = async (newItem: ItemPost) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('item_name', newItem.item_name) 
    .input('brand_id', newItem.brand_id) 
    .input('category_id', newItem.category_id) 
    .input('item_type_id', newItem.item_type_id) 
    .input('uom_id', newItem.uom_id) 
    .input('current_price', newItem.current_price) 
    .input('image_name', newItem.image_name) 
    .query(`
        INSERT INTO 
            ${tableName} (item_name, brand_id, category_id, item_type_id, uom_id, current_price, image_name) 
        OUTPUT INSERTED.*
        VALUES 
            (@item_name, @brand_id, @category_id, @item_type_id, @uom_id, @current_price, @image_name)
    `);
  return result.recordset[0];
}


export const FindExistingItem = async (newItem: ItemPost) => {

  const pool = await poolPromise; 
  const result = await pool.request()
    .input('item_name', newItem.item_name) 
    .input('brand_id', newItem.brand_id) 
    .input('category_id', newItem.category_id) 
    .input('item_type_id', newItem.item_type_id) 
    .input('uom_id', newItem.uom_id) 
    .query(`
        SELECT 
            * 
        FROM 
            ${tableName} 
        WHERE 
            item_name = @item_name 
            AND brand_id = @brand_id
            AND category_id = @category_id
            AND item_type_id = @item_type_id
            AND uom_id = @uom_id   
    `);

  return result.recordset.length > 0 ? result.recordset[0] : null; 
  
}


export const UpdateItem = async (newItem: ItemPost) => {

  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('item_id', newItem.item_id) 
    .input('item_name', newItem.item_name) 
    .input('brand_id', newItem.brand_id) 
    .input('category_id', newItem.category_id) 
    .input('item_type_id', newItem.item_type_id) 
    .input('uom_id', newItem.uom_id) 
    .input('current_price', newItem.current_price) 
    .input('image_name', newItem.image_name) 
    .query(`
        UPDATE 
            ${tableName} 
        SET 
            item_name = @item_name, 
            brand_id = @brand_id, 
            category_id = @category_id, 
            item_type_id = @item_type_id, 
            uom_id = @uom_id, 
            current_price = @current_price,
            image_name = @image_name
        OUTPUT INSERTED.*
        WHERE 
            item_id = @item_id`);
  
    return result.recordset[0]
}