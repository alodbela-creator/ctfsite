'use strict';

const { dbAll, initDB } = require('./utils/db');
const { ok, err, CORS_HEADERS } = require('./utils/helpers');

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: CORS_HEADERS, body: '' };
    }
    try {
        await initDB();
        const rows = await dbAll('SELECT name,score,`rank`,crack,geo,risk,ts FROM submissions ORDER BY score DESC LIMIT 100');
        return ok({ ok: true, rows });
    } catch (e) {
        return ok({ ok: false, rows: [] });
    }
};
