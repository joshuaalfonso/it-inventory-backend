import type { Context } from "hono";
import { ExistingSupplier, InsertSupplier, SupplierList, UpdateSupplier } from "../models/supplier.model.js";


export const GetSupplier = async (c: Context) => {


    try {
        const response = await SupplierList();
        return c.json(response)
    }

    catch (errror) {
        return c.json({success: true, message: 'Failed to load supplier.'}, 500)
    }

}

export const PostSupplier = async (c: Context) => {

    try {

        const body = await c.req.json();

        const { supplier_name, supplier_address, contact_person, contact_number } = body;

        if (!supplier_name || !supplier_address || !contact_person || !contact_number) {
            return c.json({ success: false, message: 'Missing field is required.' }, 400)
        }

        const existingSupplier = await ExistingSupplier(supplier_name);

        if (existingSupplier) {
            return c.json({ success: false, message: `Supplier '${supplier_name}' already exists.` }, 400);
        }

        const data = await InsertSupplier(body);
        return c.json({
            success: true,
            message: `'${supplier_name}' is successfully created.`,
            data
        })
    }

    catch (error) {
        console.log(error)
        return c.json({success: true, message: 'Failed to insert supplier.'}, 500)
    }

}

export const PutSupplier = async (c: Context) => {

    try {

        const body = await c.req.json();

        const { supplier_id, supplier_name, supplier_address, contact_person, contact_number } = body;

        if (!supplier_id || !supplier_name || !supplier_address || !contact_person || !contact_number) {
            return c.json({ success: false, message: 'Missing field is required.' }, 400)
        }

        const existingSupplier = await ExistingSupplier(supplier_name);

        if (existingSupplier) {
            return c.json({ 
                success: false, 
                message: `Supplier '${supplier_name}' already exists.` 
            }, 400);
        }

        const data = await UpdateSupplier(body);
        return c.json({
            success: true,
            message: `Successfully updated.`,
            data
        })

    }

    catch (error) {
        console.error(error)
        return c.json({
            success: true, 
            message: 'Failed to update supplier.'
        }, 500)
    }

}