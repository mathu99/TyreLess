import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import express from 'express';

/* Models */
import Tyre from './models/tyre';

var config = require('./config/database');
const router = express.Router();
const path = require('path');
const http = require('http');
const app = express();

app.use(cors());
app.use(bodyParser.json({limit:'5mb'}));
app.use(bodyParser.urlencoded({'extended':'false', limit:'5mb'}));

mongoose.Promise = require('bluebird');
mongoose.connect(config.database, { promiseLibrary: require('bluebird') })
    .then(() => console.log('connection succesful'))
    .catch((err) => console.error(err));

const port = process.env.PORT || '3001';
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log('Running'));

/* API */
app.get('/api/tyreConfig', (req, res, next) => {
    Tyre.find({}, 'width profile size', (err, tyreSizes) => {
        if (err) return next(err);
        else if (tyreSizes) res.send(tyreSizes)
    });
});

/* Static Files */
app.use(express.static(path.join(__dirname, '/dist'))); // Serve only the static files form the dist directory

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
})