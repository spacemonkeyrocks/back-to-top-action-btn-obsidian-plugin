// hot-reload.js
const http = require('http');

const pluginId = require('./manifest.json').id;
const requestOptions = {
    hostname: '127.0.0.1',
    port: 48125, // Default port for the Hot-Reload plugin
    path: `/reload?id=${pluginId}`,
    method: 'GET',
};

const req = http.request(requestOptions, (res) => {
    console.log(`Hot-reload request sent for '${pluginId}'. Status: ${res.statusCode}`);
});

req.on('error', (error) => {
    if (error.code === 'ECONNREFUSED') {
        console.error('Hot-reload connection refused. Is Obsidian running and the Hot-Reload plugin enabled?');
    } else {
        console.error('Hot-reload error:', error.message);
    }
});

req.end();