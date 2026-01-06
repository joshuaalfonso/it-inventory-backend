import type { Context } from "hono";
import { AllCategories, FindCategoryByName, NewCategory, UpdateCategory } from "../models/categories.model.js";


export const GetAllCategories = async (c: Context) => {

    try {
        const categories = await AllCategories();
        return c.json(categories);
    }

    catch(error) {
        const message = 'Failed to load cateogries.';
        console.error(message, error);
        return c.json({ message: message }, 500);
    }

}


export const PostCategory = async (c: Context) => {

    const body = await c.req.json();

    const { category_name } = await body;

    if (!category_name) {
        console.log(body)
      throw new Error('Category name is required');
    }

    const existingCategory = await FindCategoryByName(category_name);
    if (existingCategory) {
        return c.json({ success: false, message: `Category '${category_name}' already exists.` }, 400);
    }

    try {
        const data = await NewCategory(category_name);
        return c.json({success: true, message: 'Successfully created.', data});
    }

    catch (error) {
        console.error('Error creating brand:', error);
        return c.json('Failed to insert category', 400);
    }

}

export const PutCategory = async (c: Context) => {

    const body = await c.req.json();

    const { category_id, category_name } = await body;

    const existingBrand = await FindCategoryByName(category_name);
    if (existingBrand) {
        return c.json({ success: false, message: `Category '${category_name}' already exists.` }, 400);
    }

    try {
        const data = await UpdateCategory(category_id, category_name);
        return c.json({success: true, message: 'Successfully updated.', data});
    }

    catch (error) {
        console.error('Error updating category:', error);
        return c.json('Failed to update category', 400);
    }

}