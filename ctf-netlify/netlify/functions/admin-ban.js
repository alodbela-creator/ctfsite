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
        const { ip, reason } = parseBody(event);
        if (!ip) return ok({ ok: false, error: 'IP required' });
        await dbRun(
            'INSERT INTO banned_ips(ip,reason) VALUES(?,?) ON DUPLICATE KEY UPDATE reason=VALUES(reason)',
            [ip, reason || 'Banned by admin']
        );
        return ok({ ok: true });
    } catch (e) {
        return ok({ ok: false, error: e.message });
    }
};
