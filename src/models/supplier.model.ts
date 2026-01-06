import { poolPromise } from "../config/db.js"


export interface SupplierPost {
    supplier_id: string
    supplier_name: string
    supplier_address: string
    contact_person: string
    contact_number: string
}

const TABLE_NAME = 'supplier'

export const SupplierList = async () => {

    const pool = await poolPromise;
    const request = await pool
    .request()
    .query(`
        SELECT 
            *
        FROM 
            ${TABLE_NAME}
        ORDER BY
            created_at DESC
    `)

    return request.recordset
}

export const ExistingSupplier = async ( supplier_name: string ) => {

    const pool = await poolPromise;
    const result = await pool
    .request()
    .input('supplier_name', supplier_name)
    .query(`
        SELECT 
            *
        FROM 
            ${TABLE_NAME}
        WHERE
            supplier_name = @supplier_name
    `)

    return result.recordset.length > 0 ? result.recordset[0] : null; 

}


export const InsertSupplier = async ( newSupplier: SupplierPost ) => {

    const { 
        supplier_name, 
        supplier_address, 
        contact_person, 
        contact_number 
    } = newSupplier;

    const pool = await poolPromise;
    const request = await pool
    .request()
    .input('supplier_name', supplier_name)
    .input('supplier_address', supplier_address)
    .input('contact_person', contact_person)
    .input('contact_number', contact_number)
    .query(`
        INSERT INTO 
            ${TABLE_NAME} (supplier_name, supplier_address, contact_person, contact_number)
        OUTPUT INSERTED.* 
        VALUES 
            (@supplier_name, @supplier_address, @contact_person, @contact_number)    
    `)

    return request.recordset[0]

}


export const UpdateSupplier = async (  newSupplier: SupplierPost ) => {

   const { 
        supplier_id,
        supplier_name, 
        supplier_address, 
        contact_person, 
        contact_number 
    } = newSupplier;

    const pool = await poolPromise;
    const request = await pool
    .request()
    .input('supplier_id', supplier_id)
    .input('supplier_name', supplier_name)
    .input('supplier_address', supplier_address)
    .input('contact_person', contact_person)
    .input('contact_number', contact_number)
    .query(`
        UPDATE 
            ${TABLE_NAME}
        SET 
            supplier_name = @supplier_name,
            supplier_address = @supplier_address,
            contact_person = @contact_person,
            contact_number = @contact_number
        OUTPUT INSERTED.* 
        WHERE
            supplier_id = @supplier_id
    `)

    return request.recordset[0]

}