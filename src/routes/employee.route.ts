import { Hono } from "hono";
import { GetEmployeeList, PostEmployee, PutEmployee } from "../controllers/employee.controller.js";


export const employeeRoute = new Hono();

employeeRoute.get('', GetEmployeeList);
employeeRoute.post('', PostEmployee);
employeeRoute.put('', PutEmployee);