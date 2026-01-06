import type { Context } from "hono";
import { AllItemType, FindItemByName, InsertItemType, UpdateItemType } from "../models/item-type-model.js";


export const GetItemType = async (c: Context) => {

     try {

        const response = await AllItemType();
        return c.json(response)

    }

    catch (error) {
        console.error(error);
        return c.json({success: false, message: 'Failed to load item type.'}, 400)
    }

}


export const PostItemType = async (c: Context) => {

    try {

        const body = await c.req.json();
        
        const { item_type_name } = await body;
        
        if (!item_type_name) {
            return c.json({success: false, message: 'Item type name is required'}, 400)
        }

        const isExisting = await FindItemByName(item_type_name);

        if (isExisting) {
            return c.json({ success: false, message: 'Item type already exists.' }, 400)
        }

        const data = await InsertItemType(body);
        return c.json({ success: true, message: `'${item_type_name}' is successfully created.`, data });
        
    }

    catch (error) {
        console.error('Error creating item:', error);
        return c.json({ success: false, message: 'Failed to insert item.' }, 500);
    }

}


export const PutItemType = async (c: Context) => {


    try {

        const body = await c.req.json();

        if (!body.item_type_id) {
            return c.json({success: false, message: 'missing field is required'}, 400);
        }

        const isExisting = await FindItemByName(body.item_type_name);

        if (isExisting) {
            return c.json({ success: false, message: 'Item type already exists.' }, 400)
        }

        const data = await UpdateItemType(body);
        return c.json({ success: true, message: `Successfully updated.`, data });

    }

    catch(error) {
        console.error('Error updating item:', error);
        return c.json({ success: false, message: 'Failed to update item.' }, 500);
    }


}