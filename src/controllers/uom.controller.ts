import type { Context } from "hono";
import { AllUom, FindUomByName, NewUom } from "../models/uom.model.js";



export const GetAllUom = async (c: Context) => {

    try {
        const categories = await AllUom();
        return c.json(categories);
    }

    catch(error) {
        const message = 'Failed to load cateogries.';
        console.error(message, error);
        return c.json({ message: message }, 500);
    }

}


export const PostUom = async (c: Context) => {

    const body = await c.req.json();

    const { uom_id, uom_name } = await body;

    if (!uom_name) {
        return c.json({success: false, message: 'Unit of measure name is required.'}, 400);
    }

    const existingUom = await FindUomByName(uom_name);
    if (existingUom) {
        return c.json({ success: false, message: `Item '${uom_name}' already exists.` }, 400);
    }

    try {
        const data = await NewUom(uom_id, uom_name);
        return c.json({success: true, message: 'Successfully created.', data});
    }

    catch (error) {
        console.error('Error creating unit of measure:', error);
        return c.json('Failed to insert unit of measure', 400);
    }

}

export const PutUom = async (c: Context) => {


    const body = await c.req.json();

    const { uom_id, uom_name } = await body;

    if ( !uom_id || !uom_name ) {
        return c.json({success: false, message: 'Please fill all the blanks.'}, 400);
    }

    const existingUom = await FindUomByName(uom_name);
    if (existingUom) {
        return c.json({ success: false, message: `Unif of Measure '${uom_name}' already exists.` }, 400);
    }

    try {
        const data = await NewUom(uom_id, uom_name);
        return c.json({success: true, message: 'Successfully updated.', data});
    }

    catch (error) {
        console.error('Error updating unit of measure:', error);
        return c.json('Failed to updating unit of measure', 400);
    }

}