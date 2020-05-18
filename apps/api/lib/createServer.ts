import express = require('express');

export const createServer = (): express.Application => {
    // Create a new express app instance
    const server: express.Application = express();

    server.get('/', function (req, res) {
        res.send('Hello World!');
    });

    server.listen(3000, function () {
        console.log('App is listening on port 3000!');
    });

    return server;
};
