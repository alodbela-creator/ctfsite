'use strict';

const { ok, CORS_HEADERS } = require('./utils/helpers');

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: CORS_HEADERS, body: '' };
    }
    return ok({ flag: 'FLAG{hidden_endpoint_1}' });
};
