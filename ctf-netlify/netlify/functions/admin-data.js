'use strict';

const { dbAll, dbGet, initDB } = require('./utils/db');
const { ok, err, isAdmin, CORS_HEADERS } = require('./utils/helpers');

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: CORS_HEADERS, body: '' };
    }
    if (!isAdmin(event)) return err('Unauthorized', 401);
    try {
        await initDB();
        const [subs, banned, logs, stats] = await Promise.all([
            dbAll('SELECT * FROM submissions ORDER BY id DESC LIMIT 200'),
            dbAll('SELECT * FROM banned_ips ORDER BY ts DESC'),
            dbAll('SELECT * FROM req_log ORDER BY id DESC LIMIT 300'),
            dbGet('SELECT COUNT(*) as total, ROUND(AVG(score)) as avg, MAX(score) as top FROM submissions'),
        ]);
        return ok({ ok: true, subs, banned, logs, stats });
    } catch (e) {
        return ok({ ok: false, error: e.message });
    }
};
