import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let db;

export const connectDB = async () => {
  try {
    console.log("HOST:", process.env.DB_HOST);
    console.log("DB_PORT:", process.env.DB_PORT);

    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 60000,
      timezone: '+05:30',
    });

    await db.query("SET time_zone = '+05:30'");
    console.log("Timezone set to IST");
    return db;
  } catch (error) {
    console.error("DB Connection Error:", error.message);
    return null;
  }
};

const getDb = () => db;

export default getDb;