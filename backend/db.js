import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.MYSQL_PUBLIC_URL) {
  throw new Error("MYSQL_PUBLIC_URL is missing in .env");
}

const db = await mysql.createConnection(process.env.MYSQL_PUBLIC_URL);

console.log("MySQL Connected");

export default db;