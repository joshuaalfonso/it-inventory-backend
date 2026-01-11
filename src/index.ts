
import { serve } from '@hono/node-server'
import { Hono, type Context } from 'hono'
import { prettyJSON } from 'hono/pretty-json'
import { brandRoute } from './routes/brands.route.js';
import { cors } from 'hono/cors'
import { categoriesRoute } from './routes/categories.route.js';
import { uomRoute } from './routes/uom.route.js';
import { itemsRoute } from './routes/items.route.js';
import { departmentRoute } from './routes/department.route.js';
import { employeeRoute } from './routes/employee.route.js';
import { itemTypeRoute } from './routes/item-type.route.js';
import { supplierRoute } from './routes/supplier.route.js';
import { serveStatic } from '@hono/node-server/serve-static'; 
import path, { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { poolPromise } from './config/db.js';
import { userRoute } from './routes/user.route.js';
import { purchaseOrderRoute } from './routes/purchase-order.route.js';
import { incomingRoute } from './routes/incoming.route.js';

const app = new Hono();

// const corsOptions = {
//   origin: '*',
//   methods: ['GET', 'POST', 'PUT']
// }


app.use(prettyJSON());
app.use(cors())


app.get('/', (c) => {
  return c.text('Server is running.')
})

app.route('/brand', brandRoute);
app.route('/category', categoriesRoute);
app.route('/uom', uomRoute);
app.route('/item', itemsRoute);
app.route('/department', departmentRoute);
app.route('/employee', employeeRoute);
app.route('/item-type', itemTypeRoute);
app.route('/supplier', supplierRoute);
app.route('/purchase-order', purchaseOrderRoute);
app.route('/user', userRoute);
app.route('/incoming', incomingRoute);


// Serve from project/uploads
app.use('/uploads/*', serveStatic({ root: './' }));

// async function insertBrandsLoop() {
//     try {
//       const pool = await poolPromise;

//         for (let i = 1; i <= 500; i++) {
//             await pool.request()
//                 .input('brand_name', `Brand ${i}`)
//                 .query('INSERT INTO brand (brand_name) VALUES (@brand_name)');

//             console.log(`Inserted Brand ${i}`);
//         }

//         console.log('All 100 brands inserted successfully!');
        
//     } catch (err) {
//         console.error('Error inserting brands:', err);
        
//     }
// }

// insertBrandsLoop();


serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
