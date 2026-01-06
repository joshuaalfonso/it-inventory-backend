import { poolPromise } from "../config/db.js"


interface EmployeePost {
    employee_id: number,
    employee_name: string,
    email: string,
    department_id: number
} 


const tableName = 'employee';

export const AllEmployee = async () => {

    const pool = await poolPromise;

    const request = await pool
    .request()
    .query(`
        SELECT 
            employee.employee_id,
            employee.employee_name,
            employee.email,
            employee.department_id,
            d.department_name,
            employee.created_at
        FROM 
            employee 
        LEFT JOIN 
            department as d
        ON 
            employee.department_id = d.department_id
        ORDER BY created_at DESC
    `)

    return request.recordset

}

export const EmployeeByID = async (employee_id: number) => {
    const pool = await poolPromise;
    const result = await pool
    .request()
    .query(`
        SELECT 
        employee.employee_id,
        employee.employee_name,
        employee.email,
        employee.department_id,
        d.department_name,
        employee.created_at
        FROM 
            employee 
        LEFT JOIN 
            department as d
        ON 
            employee.department_id = d.department_id
        
        WHERE employee_id = ${employee_id}
    `);
    return result.recordset[0];
}

export const FindExistingEmployee = async (newEmployee: EmployeePost) => {

    const pool = await poolPromise;

    const result = await pool.request()
    .input('employee_name', newEmployee.employee_name) 
    .input('email', newEmployee.email) 
    .input('department_id', newEmployee.department_id) 
    .query(`
        SELECT 
            *
        FROM 
            ${tableName}
        WHERE 
            employee_name = @employee_name AND
            email = @email AND
            department_id = @department_id
    `)

    return result.recordset.length > 0 ? result.recordset[0] : null; 

}


export const NewEmployee = async (newEmployee: EmployeePost) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('employee_name', newEmployee.employee_name) 
    .input('email', newEmployee.email) 
    .input('department_id', newEmployee.department_id) 
    .query(`
        INSERT INTO 
            ${tableName} (employee_name, email, department_id) 
        OUTPUT INSERTED.* 
        VALUES 
            (@employee_name, @email, @department_id)`);
    return result.recordset[0];
}


export const UpdateEmployee = async (newEmployee: EmployeePost) => {

    const pool = await poolPromise;

    const result = pool.request()
    .input('employee_id', newEmployee.employee_id) 
    .input('employee_name', newEmployee.employee_name) 
    .input('email', newEmployee.email) 
    .input('department_id', newEmployee.department_id) 
    .query(`
        UPDATE 
            ${tableName}
        SET 
            employee_name = @employee_name,
            email = @email,
            department_id = @department_id
        OUTPUT INSERTED.* 
        WHERE 
            employee_id = @employee_id
    `)

    return (await result).recordset[0]

}