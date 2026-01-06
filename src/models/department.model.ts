import { poolPromise } from "../config/db.js";





const tableName = 'department'


export const AllDepartment = async () => {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(`SELECT * FROM ${tableName}`);
    return result.recordset;
}


export const NewDepartment = async (department_name: string) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('department_name', department_name) 
    .query(`
      INSERT INTO 
        ${tableName} (department_name) 
      OUTPUT INSERTED.* 
      VALUES 
        (@department_name)
    `);
  return result.recordset[0];
}

export const FindDepartmentByName = async (department_name: string) => {

  const pool = await poolPromise; 
  const result = await pool.request()
    .input('department_name', department_name) 
    .query(`SELECT * FROM ${tableName} WHERE department_name = @department_name`);

  return result.recordset.length > 0 ? result.recordset[0] : null; 
  
}

export const Updatedepartment = async (department_id: number, department_name: string) => {

  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('department_id', department_id) 
    .input('department_name', department_name) 
    .query(`
      UPDATE 
        ${tableName} 
      SET 
        department_name = @department_name 
      OUTPUT INSERTED.* 
      WHERE 
        department_id = @department_id
    `);
  
    return result.recordset[0]
}