'use strict';

const mysql = require('mysql2/promise');

let pool;

function getPool() {
    if (!pool) {
        pool = mysql.createPool({
            host:               process.env.MYSQL_HOST     || process.env.DB_HOST     || 'localhost',
            port:               process.env.MYSQL_PORT     || process.env.DB_PORT     || 3306,
            user:               process.env.MYSQL_USER     || process.env.DB_USER     || 'root',
            password:           process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
            database:           process.env.MYSQL_DATABASE || process.env.DB_NAME     || 'ctf',
            waitForConnections: true,
            connectionLimit:    5,
            ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
        });
    }
    return pool;
}

async function dbRun(sql, params = []) {
    const p = getPool();
    const [result] = await p.execute(sql, params);
    return result;
}

async function dbAll(sql, params = []) {
    const p = getPool();
    const [rows] = await p.execute(sql, params);
    return rows;
}

async function dbGet(sql, params = []) {
    const rows = await dbAll(sql, params);
    return rows[0] || null;
}

async function initDB() {
    await dbRun(`CREATE TABLE IF NOT EXISTS submissions (
        id    INT AUTO_INCREMENT PRIMARY KEY,
        name  VARCHAR(100),
        score INT,
        rank  VARCHAR(50),
        crack VARCHAR(50),
        ip    VARCHAR(45),
        geo   VARCHAR(50),
        risk  VARCHAR(20),
        ts    DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    await dbRun(`CREATE TABLE IF NOT EXISTS banned_ips (
        ip     VARCHAR(45) PRIMARY KEY,
        reason TEXT,
        ts     DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    await dbRun(`CREATE TABLE IF NOT EXISTS req_log (
        id     INT AUTO_INCREMENT PRIMARY KEY,
        ip     VARCHAR(45),
        method VARCHAR(10),
        path   VARCHAR(500),
        ua     VARCHAR(200),
        ts     DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
}

module.exports = { dbRun, dbAll, dbGet, initDB };
