import type { Context } from "hono";
import { AllEmployee, EmployeeByID, FindExistingEmployee, NewEmployee, UpdateEmployee } from "../models/employee.model.js";


export const GetEmployeeList = async (c: Context) => {

    try {
        const response = await AllEmployee();
        return c.json(response)
    }

    catch (error) {
        console.error('Error fetching all employee:', error);
        return c.json({ message: 'Failed to fetch load data.' }, 500);
    }

}


export const PostEmployee = async (c: Context) => {

    try {

        const body = await c.req.json();

        const { 
            employee_name, 
            email, 
            department_id 
        } = await body;

        if ( !employee_name || !email || !department_id) {
            return c.json({success: false, message: 'Missing field is required.'}, 409)
        }

        const isExisting = await FindExistingEmployee(body);
        if (isExisting) {
            return c.json({ success: false, message: 'Employee already exists.' }, 400)
        }

        const response = await NewEmployee(body);
        const data = await EmployeeByID(response.employee_id);
        return c.json({ success: true, message: 'Successfully created.', data });

    }

    catch (error) {
        console.error('Error creating:', error);
        return c.json('Failed to insert', 400);
    }


}

export const PutEmployee = async (c: Context) => {

    try {

        const body = await c.req.json();

        const { 
            employee_id,
            employee_name, 
            email, 
            department_id 
        } = await body; 

        if ( !employee_id || !employee_name || !email || !department_id ) {
            console.log(employee_name, email, department_id)
            return c.json({success: false, message: 'Missing field is required.'}, 409)
        }

        const isExisting = await FindExistingEmployee(body);
        if (isExisting) {
            return c.json({ success: false, message: 'Employee already exists.' }, 400)
        }

        const response = await UpdateEmployee(body);
        const data = await EmployeeByID(response.employee_id);
        return c.json({ success: true, message: 'Successfully updated.', data });
        
    }

    catch (error) {
        console.error('Error updating:', error);
        return c.json('Failed to update', 400);
    }

    
}