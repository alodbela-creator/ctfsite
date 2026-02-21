'use strict';

function getIP(event) {
    return (event.headers['x-forwarded-for'] || '').split(',')[0].trim()
        || event.headers['x-real-ip']
        || '0.0.0.0';
}

function classifyIP(ip) {
    const rules = [
        {p:'185.220.',label:'TOR',risk:'CRITICAL'},{p:'199.249.',label:'TOR',risk:'CRITICAL'},
        {p:'104.244.',label:'VPN',risk:'HIGH'},{p:'13.',label:'AWS',risk:'MEDIUM'},
        {p:'18.',label:'AWS',risk:'MEDIUM'},{p:'52.',label:'AWS',risk:'MEDIUM'},
        {p:'34.',label:'GCP',risk:'MEDIUM'},{p:'35.',label:'GCP',risk:'MEDIUM'},
        {p:'138.197.',label:'DO',risk:'MEDIUM'},{p:'127.',label:'Local',risk:'CLEAN'},
        {p:'10.',label:'LAN',risk:'CLEAN'},{p:'192.168.',label:'LAN',risk:'CLEAN'},
        {p:'::1',label:'Local',risk:'CLEAN'},
    ];
    for (const r of rules) if (ip.startsWith(r.p)) return {label:r.label,risk:r.risk};
    return {label:'Unknown',risk:'LOW'};
}

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-token',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
};

function ok(body, status = 200) {
    return { statusCode: status, headers: CORS_HEADERS, body: JSON.stringify(body) };
}

function err(msg, status = 400) {
    return { statusCode: status, headers: CORS_HEADERS, body: JSON.stringify({ ok: false, error: msg }) };
}

function parseBody(event) {
    try {
        if (event.headers['content-type'] && event.headers['content-type'].includes('application/json')) {
            return JSON.parse(event.body || '{}');
        }
        const params = new URLSearchParams(event.body || '');
        const obj = {};
        for (const [k, v] of params.entries()) obj[k] = v;
        return obj;
    } catch (e) {
        return {};
    }
}

const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'danik2026';

function isAdmin(event) {
    return (event.headers['x-admin-token'] || '') === ADMIN_PASS
        || (parseBody(event).token || '') === ADMIN_PASS;
}

module.exports = { getIP, classifyIP, ok, err, parseBody, isAdmin, CORS_HEADERS, ADMIN_PASS };
