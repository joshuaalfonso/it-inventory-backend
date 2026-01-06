import { poolPromise } from "../config/db.js";





const tableName: string = 'category';


export const AllCategories = async () => {

    const pool = await poolPromise;
    const result = await pool
    .request()
     .query(`SELECT * FROM ${tableName}`);
    return result.recordset;

}

export const FindCategoryByName = async (category_name: string) => {
  try {
    const pool = await poolPromise; 
    const result = await pool.request()
      .input('category_name', category_name) 
      .query(`SELECT * FROM ${tableName} WHERE category_name = @category_name`);

    return result.recordset.length > 0 ? result.recordset[0] : null; 
  } catch (err) {
    console.error('Error querying database:', err);
    throw new Error('Database query failed');
  }
}


export const NewCategory = async (category_name: string) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('category_name', category_name) 
    .query(`
      INSERT INTO 
        ${tableName} (category_name) 
      OUTPUT INSERTED.* 
      VALUES 
        (@category_name)
    `);
  return result.recordset[0];
}

export const UpdateCategory = async (category_id: number, category_name: string) => {

  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('category_id', category_id) 
    .input('category_name', category_name) 
    .query(`
      UPDATE 
        ${tableName} 
      SET 
        category_name = @category_name
      OUTPUT INSERTED.*  
      WHERE 
        category_id = @category_id
    `);
  
    return result.recordset[0]
}