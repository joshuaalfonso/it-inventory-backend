import type { Context } from "hono";
import { AllDepartment, FindDepartmentByName, NewDepartment, Updatedepartment } from "../models/department.model.js";



export const getAllDepartment = async (c: Context) => {

    try {
        
        const department = await AllDepartment();
        return c.json(department);

    } catch (err) {

        console.error('Error fetching all department:', err);
        return c.json({ message: 'Failed to fetch load data.' }, 500);

    }

}


export const PostDepartment = async (c: Context) => {

    const body = await c.req.json();

    const { department_name } = body;

    if (!department_name) {
        return c.json({success: false, message: 'Department name is required.'}, 400);
    }

    const existingDepartment = await FindDepartmentByName(department_name);
    if (existingDepartment) {
        return c.json({ success: false, message: `'${department_name}' already exists.` }, 400);
    }

    try {
        const data = await NewDepartment(department_name);
        return c.json({ success: true, message: `'${department_name}' is successfully created.`, data });
    }

    catch (error) {
        console.error('Error creating department:', error);
        return c.json('Failed to insert department', 400);
    }

}


export const PutDepartment = async (c: Context) => {

    const body = c.req.json();

    const { department_id, department_name } = await body;

    if (!department_name) {
        return c.json({success: false, message: 'Department name is required.'}, 400);
    }

    const existingDepartment = await FindDepartmentByName(department_name);
    if (existingDepartment) {
        return c.json({ success: false, message: `'${department_name}' already exists.` }, 400);
    }

    try {
        const data = await Updatedepartment(department_id, department_name);
        return c.json({ success: true, message: `'Successfully updated.`, data});
    }

    catch (error) {
        console.error('Error updating department:', error);
        return c.json('Failed to update item', 400);
    }


}