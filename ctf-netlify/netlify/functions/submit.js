'use strict';

const { dbRun, dbGet, initDB } = require('./utils/db');
const { getIP, classifyIP, ok, err, parseBody, CORS_HEADERS } = require('./utils/helpers');
const { score } = require('./utils/score');

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: CORS_HEADERS, body: '' };
    }
    if (event.httpMethod !== 'POST') return err('Method not allowed', 405);

    try {
        await initDB();
        const ip  = getIP(event);
        const geo = classifyIP(ip);

        // Check ban
        const banned = await dbGet('SELECT ip FROM banned_ips WHERE ip=?', [ip]);
        if (banned) return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ ok: false, error: 'Banned' }) };

        // Log request
        dbRun('INSERT INTO req_log(ip,method,path,ua) VALUES(?,?,?,?)',
            [ip, 'POST', '/submit', (event.headers['user-agent'] || '').slice(0, 200)]).catch(() => {});

        const body = parseBody(event);
        const { name, password } = body;

        if (!name || !String(name).trim()) return ok({ ok: false, error: 'Name required' });
        if (!password || !String(password).length) return ok({ ok: false, error: 'Password required' });

        const n = String(name).trim().replace(/[^\w\s\-]/g, '').slice(0, 30) || 'Anonymous';
        const r = score(String(password));

        await dbRun(
            'INSERT INTO submissions(name,score,rank,crack,ip,geo,risk) VALUES(?,?,?,?,?,?,?)',
            [n, r.score, r.rank, r.crack, ip, geo.label, geo.risk]
        );

        return ok({ ok: true, ...r });
    } catch (e) {
        return ok({ ok: false, error: e.message });
    }
};
