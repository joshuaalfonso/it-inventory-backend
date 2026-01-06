import { Hono } from "hono";
import { getAllDepartment, PostDepartment, PutDepartment } from "../controllers/department.controller.js";


export const departmentRoute = new Hono();

departmentRoute.get('', getAllDepartment);
departmentRoute.post('', PostDepartment);
departmentRoute.put('', PutDepartment);