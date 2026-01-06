import { poolPromise } from "../config/db.js"




const tableName = 'uom';


export const AllUom = async () => {

    const pool = await poolPromise;

    const result = await pool
    .request()
    .query(`SELECT * FROM ${tableName}`);
    return result.recordset;


}

export const NewUom = async (uom_id: number | null, uom_name: string) => {
  let query = '';

  const pool = await poolPromise;
  const request = pool.request().input('uom_name', uom_name);

  if (!uom_id || uom_id === 0) {
      // INSERT
      query = `
        INSERT INTO 
          ${tableName} (uom_name)
        OUTPUT INSERTED.*  
        VALUES 
          (@uom_name)
      `;
  } else {
      // UPDATE
      query = `
        UPDATE 
          ${tableName} 
        SET 
          uom_name = @uom_name
        OUTPUT INSERTED.*  
        WHERE 
          uom_id = @uom_id`;
      request.input('uom_id', uom_id);
  }

  const result = await request.query(query);
  return result.recordset[0];
}

export const FindUomByName = async (uom_name: string) => {

  const pool = await poolPromise; 
  const result = await pool.request()
    .input('uom_name', uom_name) 
    .query(`SELECT * FROM ${tableName} WHERE uom_name = @uom_name`);

  return result.recordset.length > 0 ? result.recordset[0] : null; 
  
}

