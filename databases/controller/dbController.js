const sql = require("better-sqlite3");
const db = new sql("./databases/main.db");

db.prepare(
  `CREATE TABLE IF NOT EXISTS users (
    uuid TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    nickname TEXT,
    gender TEXT,
    dob TEXT,
    about TEXT,
    interests TEXT,
    skills TEXT); `
).run();
db.prepare(
        `CREATE TABLE IF NOT EXISTS chats (
        senderID TEXT NOT NULL,
        receiverID TEXT,
        message TEXT NOT NULL,
        status TEXT NOT NULL,
        msgTime TIMESTAMP DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW')));`
).run();


module.exports = db;
