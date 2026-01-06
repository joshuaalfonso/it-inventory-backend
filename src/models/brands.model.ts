import { poolPromise } from "../config/db.js";


const tableName: string = 'brand';

export const AllBrands = async () => {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(`SELECT * FROM ${tableName} ORDER BY created_at DESC`);
    return result.recordset;
}


export const BrandByID = async (brand_id: number) => {
    const pool = await poolPromise;
    const result = await pool
    .request()
    .query(`SELECT * FROM ${tableName} WHERE brand_id = $${brand_id}`);
    return result.recordset;
}


export const NewBrand = async (brand_name: string) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('brand_name', brand_name) 
    .query(`
      INSERT INTO 
        ${tableName} (brand_name)
      OUTPUT INSERTED.* 
      VALUES 
        (@brand_name)`);
  return result.recordset[0];
}

export const FindBrandByName = async (brand_name: string) => {

  const pool = await poolPromise; 
  const result = await pool.request()
    .input('brand_name', brand_name) 
    .query(`SELECT * FROM ${tableName} WHERE brand_name = @brand_name`);

  return result.recordset.length > 0 ? result.recordset[0] : null; 
  
}

export const UpdateBrand = async (brand_id: number, brand_name: string) => {

  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('brand_id', brand_id) 
    .input('brand_name', brand_name) 
    .query(`
      UPDATE 
        ${tableName} 
      SET 
        brand_name = @brand_name 
      OUTPUT INSERTED.*
      WHERE 
        brand_id = @brand_id
    `);
  
    return result.recordset[0]
}

