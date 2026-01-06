// db.ts
import sql from 'mssql';
import 'dotenv/config';

const config: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER as string, 
  database: process.env.DB_DATABASE,
  options: {
    trustServerCertificate: true 
  }
}; 

export const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to database');
    return pool;
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    throw err;
  });
