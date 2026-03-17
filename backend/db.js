import mysql from "mysql2/promise";

const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "kumar",
  database: "upi_system",
});

console.log("MySQL Connected");

export default db;