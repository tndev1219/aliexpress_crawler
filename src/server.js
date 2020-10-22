var http = require('http');
var app = require('./app');
require('dotenv').config();
const port = process.env.PORT || 4000;
const server = http.createServer(app);
let throng = require('throng');
console.log('The server is running in ' + port + ' port.');

let workers = process.env.WEB_CONCURRENCY || 1;

const start = () => {
    server.listen(port);  
}

throng({
	workers,
	start
});
    