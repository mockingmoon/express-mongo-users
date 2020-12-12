const http = require('http');
const app = require('../app');

const host = 'localhost';
const port = 3000;

app.set('port',port);

const server = http.createServer(app);

server.listen(app.get('port'), () => {
    console.log(`Server running at http://${host}:${port}`);
});

process.on('SIGINT', async () => {
    console.log('Initiating server shutdown. . .');
    console.log('Please wait for shutdown message before proceeding. . .');
    let msg = await server.close(() => {
        console.log("Server successful shutdown.");
    });
});