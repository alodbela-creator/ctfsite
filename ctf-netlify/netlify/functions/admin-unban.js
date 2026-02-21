'use strict';

const { dbRun, initDB } = require('./utils/db');
const { ok, err, isAdmin, parseBody, CORS_HEADERS } = require('./utils/helpers');

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: CORS_HEADERS, body: '' };
    }
    if (!isAdmin(event)) return err('Unauthorized', 401);
    try {
        await initDB();
        const { ip } = parseBody(event);
        if (!ip) return ok({ ok: false, error: 'IP required' });
        await dbRun('DELETE FROM banned_ips WHERE ip=?', [ip]);
        return ok({ ok: true });
    } catch (e) {
        return ok({ ok: false, error: e.message });
    }
};
