//Install express server
const express = require('express');
const app = express();
const path = require('path');
const http = require('http');

// Serve only the static files form the dist directory
app.use(express.static(path.join(__dirname, '/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
})

const port = process.env.PORT || '3001';
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log('Running'));

// Start the app by listening on the default Heroku port
// app.listen(process.env.PORT || 8080);