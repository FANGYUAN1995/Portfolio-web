const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// 注意：使用者檔案名稱為「Porfolio.db」（保留原始拼字）。
const DB_FILE = process.env.SQLITE_FILE || path.join(__dirname, 'Porfolio.db');

let db;

function openDb() {
    if (db) return db;
    db = new sqlite3.Database(DB_FILE);
    return db;
}

function normalizeParams(params) {
    if (!params) return [];
    return Array.isArray(params) ? params : [params];
}

function getSqlVerb(sql) {
    const s = String(sql || '').trim().toUpperCase();
    return s.split(/\s+/)[0] || '';
}

function allAsync(sql, params) {
    const database = openDb();
    const p = normalizeParams(params);
    return new Promise((resolve, reject) => {
        database.all(sql, p, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

function runAsync(sql, params) {
    const database = openDb();
    const p = normalizeParams(params);
    return new Promise((resolve, reject) => {
        database.run(sql, p, function (err) {
            if (err) return reject(err);
            // sqlite3 會在目前 this 物件上提供 lastID / changes 屬性
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

/**
 * 一個簡單的相容層，讓既有程式碼可以繼續使用：
 *   const [rows] = await pool.query(sql, params)
 * 用法與 mysql2/promise 類似。
 */
const pool = {
    async query(sql, params) {
        const verb = getSqlVerb(sql);
        if (verb === 'SELECT' || verb === 'PRAGMA' || verb === 'WITH') {
            const rows = await allAsync(sql, params);
            return [rows];
        }
        const result = await runAsync(sql, params);
        // mimic mysql2 result shape where server.js expects `result.insertId`
        return [{ insertId: result.lastID, affectedRows: result.changes, changes: result.changes }];
    }
};

async function initDb() {
    try {
        openDb();

        // 啟用外鍵約束
        await pool.query('PRAGMA foreign_keys = ON');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                subject TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `);

        console.log(`SQLite database initialized successfully: ${DB_FILE}`);
    } catch (err) {
        console.error('Database initialization failed:', err);
    }
}

module.exports = { pool, initDb, DB_FILE };
