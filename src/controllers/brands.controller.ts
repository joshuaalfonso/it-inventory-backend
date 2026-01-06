import type { Context } from "hono";
import { AllBrands, BrandByID, FindBrandByName, NewBrand, UpdateBrand } from "../models/brands.model.js";



export const GetAllBrands = async (c: Context) => {
    try {
      const brands = await AllBrands();
      return c.json(brands);
    } catch (err) {
      console.error('Error fetching all brands:', err);
      return c.json({ message: 'Failed to fetch brand data.' }, 500);
    }
} 

export const GetBrandByID = async (c: Context) => {

    const idParam = c.req.param('id');
    const id = Number(idParam);   

    if (isNaN(id)) {
        return c.text('Invalid ID', 400);
    }

    try {
        const brandByID = await BrandByID(id);
        return c.json(brandByID);
    }

    catch (err) {
        console.error('Error fetching brand:', err);
        return c.json({ message: 'Failed to fetch brand by id.' }, 500);
    }

}


export const CreateBrand = async (c: Context) => {

  try {

    const body = await c.req.json();
    const { brand_name } = await body;
    
    if (!brand_name) {
        console.log(body)
      throw new Error('Brand name is required');
    }

    const existingBrand = await FindBrandByName(brand_name);
    
    if (existingBrand) {
      return c.json({ success: false, message: `'${brand_name}' already exists.` }, 400);
    }

    const data = await NewBrand(brand_name);

    return c.json({
      success: true, 
      message: `'${data.brand_name}' is created.`,
      data
    });

  } catch (error) {
    console.error('Error creating brand:', error);
    return c.json({ success: false, message: `Failed to crate brand` }, 400);
  }

  // try {
  //   const numberOfBrands = 1000
  //   const brands = []

  //   for (let i = 1; i <= numberOfBrands; i++) {
  //     brands.push(`('Brand${i}')`)
  //   }

  //   const batchSize = 200
  //   const pool = await poolPromise

  //   for (let i = 0; i < brands.length; i += batchSize) {
  //     const batchValues = brands.slice(i, i + batchSize).join(',')
  //     const query = `INSERT INTO brand (brand_name) VALUES ${batchValues}`
  //     await pool.request().query(query)
  //   }

  //   return c.json({ message: `Inserted ${numberOfBrands} brands` })
  // } catch (error) {
  //   return c.json({ error: 'Failed to create brands' }, 500)
  // }

}

export const PutBrand = async (c: Context) => {

    try {

        const body = await c.req.json();

        const { brand_id, brand_name } = await body;

        if (!brand_id) {
            console.log(body)
            throw new Error('Brand name is required');
        }

        const existingBrand = await FindBrandByName(brand_name);
        if (existingBrand) {
          return c.json({ success: false, message: `Brand '${brand_name}' already exists.` }, 400);
        }

        const data = await UpdateBrand(brand_id, brand_name);

        return c.json({
          success: true, 
          message: `Item updated!`,
          data
        });
    }

    catch (error) {
        console.error('Error updating brand:', error);
        throw error; 
    }


}

