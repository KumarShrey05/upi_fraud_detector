import mysql from "mysql2"

const db = mysql.createConnection({
 host: "localhost",
 user: "root",
 password: "haddi3003",
 database: "upi_system"
})

db.connect((err) => {
 if(err){
  console.log("Database connection failed", err.message);
 } else {
  console.log("MySQL Connected")
 }
})

export default db