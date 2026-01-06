import type { Context } from "hono";
import { AllItems, FindExistingItem, ItemByID, NewItem, UpdateItem, type ItemPost } from "../models/items.model.js";
import path, { extname } from "path";
import fs from 'fs';

export const GetItems = async (c: Context) => {

    try {

        const response = await AllItems();
        return c.json(response);

    }

    catch (error) {
        const message = 'Failed to load items.';
        console.error(message, error);
        return c.json({ message: message }, 500);
    }

}


export const GetItemByID = async (c: Context) => {

    const { item_id } = c.req.param()

    if (!item_id) {
        return c.json({ message: 'No id found' }, 400);
    }

    try {

        const response = await ItemByID(+item_id);
        return c.json(response);

    }

    catch (error) {
        const message = 'Failed to load items.';
        console.error(message, error);
        return c.json({ message: message }, 500);
    }

}

export const PostItems = async (c: Context) => {
    
    const body = await c.req.parseBody();

    let fileName: string | null = null;

    const file = body.image;

    // const file = body.image;

    // // type check first
    // if (!(file instanceof File)) {
    //     return c.text('No image uploaded or wrong field name', 400);
    // }

    // const buffer = Buffer.from(await file.arrayBuffer());

    // // get original extension
    // const extension = extname(file.name);

    // // custom file name
    // const fileName: string = `${crypto.randomUUID()}${extension}`;

    // //  save to /uploads
    // const uploadDir = path.join(process.cwd(), 'uploads');
    // if (!fs.existsSync(uploadDir)) {
    //     fs.mkdirSync(uploadDir);
    // }

    // const filePath = path.join(uploadDir, fileName);
    // await fs.promises.writeFile(filePath, buffer);

        // Check if file exists and is a valid File
    if (file instanceof File && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());

        const extension = extname(file.name);

        fileName = `${crypto.randomUUID()}${extension}`;

        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        const filePath = path.join(uploadDir, fileName);
        await fs.promises.writeFile(filePath, buffer);
    }

    const itemData = {
        item_id: Number(body.item_id),
        item_name: String(body.item_name),
        brand_id: Number(body.brand_id),
        category_id: Number(body.category_id),
        item_type_id: Number(body.item_type_id),
        uom_id: Number(body.uom_id),
        current_price: Number(body.current_price) || 0,
        image_name: fileName,
    };

    try {

        const existingItem = await FindExistingItem(itemData);
        if (existingItem) {
            return c.json({ success: false, message: `Item already exists.` }, 400);
        }

        const response = await NewItem(itemData);
        const data = await ItemByID(response.item_id);
        return c.json({success: true, message: 'Successfully created.', data});
    }

    catch (error) {
        console.error('Error creating item:', error);
        return c.json('Failed to insert item.', 400);
    }

}


// export const PostItems = async (c: Context) => {

//     const body = await c.req.json();

//     try {

//         const existingBrand = await FindExistingItem(body);
//         if (existingBrand) {
//             return c.json({ success: false, message: `Item already exists.` }, 400);
//         }

//         await NewItem(body);
//         return c.json({success: true, message: 'Successfully created.'});
//     }

//     catch (error) {
//         console.error('Error creating item:', error);
//         return c.json('Failed to insert item.', 400);
//     }


// }


export const PutItems = async (c: Context) => {

    const body = await c.req.parseBody();
    
    const file = body.image;
    const itemId  = Number(body.item_id);

    //  1. Fetch existing item (to get old image name)
    const existingItem = await ItemByID(itemId); // <-- your DB logic
    if (!existingItem) {
        return c.json({ success: false, message: 'Item not found.' }, 404);
    }

    let newFileName: string | null = null;

    // 2. If new image uploaded, process it
    if (file instanceof File && file.size > 0) {
        
        // Delete old image
        if (existingItem.image_name) {
            // console.log('Old image path',existingItem.image_name)
            const oldFilePath = path.join(process.cwd(), 'uploads', existingItem.image_name);
            if (fs.existsSync(oldFilePath)) {
                await fs.promises.unlink(oldFilePath);
            }
        }

        // Save new image
        const buffer = Buffer.from(await file.arrayBuffer());
        const extension = extname(file.name).toLowerCase() || '.png';
        newFileName = `${crypto.randomUUID()}${extension}`;

        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        const filePath = path.join(uploadDir, newFileName);
        await fs.promises.writeFile(filePath, buffer);
    }
  
        // 3. Build update data
    const updatedItemData: ItemPost = {
        item_id: Number(body.item_id),
        item_name: String(body.item_name),
        brand_id: Number(body.brand_id),
        category_id: Number(body.category_id),
        item_type_id: Number(body.item_type_id),
        uom_id: Number(body.uom_id),
        current_price: Number(body.current_price) || 0,
        image_name: newFileName ?? existingItem.image_name
    };

    // console.log(updatedItemData)

    try {

        const existingBrand = await FindExistingItem(updatedItemData);
        if (existingBrand && !file) {
            return c.json({ success: false, message: `Item already exists.` }, 400);
        }

        const response = await UpdateItem(updatedItemData);
        const data = await ItemByID(response.item_id);
        return c.json({success: true, message: 'Successfully updated.', data});
    }

    catch (error) {
        console.error('Error updating item:', error);
        return c.json('Failed to update', 400);
    }

}




// export const PutItems = async (c: Context) => {

//     const body = await c.req.json();

//     try {

//         const existingBrand = await FindExistingItem(body);
//         if (existingBrand) {
//             return c.json({ success: false, message: `Item already exists.` }, 400);
//         }

//         await UpdateItem(body);
//         return c.json({success: true, message: 'Successfully updated.'});
//     }

//     catch (error) {
//         console.error('Error updating item:', error);
//         return c.json('Failed to update', 400);
//     }

// }