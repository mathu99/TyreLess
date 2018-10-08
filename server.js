const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');

/* Models */
const Tyre = require('./models/tyre');
const PartnerTyre = require('./models/partnerTyre');
const Partner = require('./models/partner');

var config = require('./config/database');
const router = express.Router();
const path = require('path');
const http = require('http');
const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ 'extended': 'false', limit: '5mb' }));

mongoose.Promise = require('bluebird');
mongoose.connect(config.database, { promiseLibrary: require('bluebird') })
    .then(() => console.log('connection succesful'))
    .catch((err) => console.error(err));

const port = process.env.PORT || '3001';
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log('Running'));

const uniq = (a) => {
    return Array.from(new Set(a));
}

/* API */
app.get('/api/tyreConfig', (req, res, next) => {    /* Get all unique width / profile / size */
    Tyre.find({}, 'width profile size', (err, tyreSizes) => {
        if (err) return next(err);
        else if (tyreSizes) {
            let obj = { /* Construct filtered response */
                tyreWidths: uniq(tyreSizes.map(e => e.width)).sort((a, b) => { return +a - +b }),
                tyreProfiles: uniq(tyreSizes.map(e => e.profile)).sort((a, b) => { return +a - +b }),
                wheelSizes: uniq(tyreSizes.map(e => e.size)).sort((a, b) => { return +a - +b }),
            }
            res.send(obj);
        }
    });
});

app.get('/api/tyreSearch', (req, res, next) => {
    let query = {   /* Filtering on tyre */
        vehicleType: (req.query.vehicleType) ? req.query.vehicleType : 'Car',
        width: req.query.width,
        profile: req.query.profile,
        size: req.query.size,
    }
    if (req.query.brand) {
        query.brand = req.query.brand;
    }

    let partnerFilter = { /* Filtering on partner - location & status */
        province: req.query.province,
        status: 'Active',
    }
    if (req.query.suburb) {
        partnerFilter.suburb = req.query.suburb;
    }

    Tyre.find(query, '_id').exec((err, tyres) => {
        if (err) return next(err);
        else if (tyres) {
            Partner.find(partnerFilter, '_id', (err, partners) => {
                if (err) return next(err);
                else if (partners) {
                    let partnerIds = partners.map(p => p._id),
                        tyreIds = tyres.map(tyre => tyre._id);
                    let partnerTyreReturn = 'livePrice liveInclusion',  /* Fields to return */
                        partnerReturn = 'branchName branchPin customerCode logo province retailerName salesEmail suburb',
                        tyreReturn = 'brand profile size speedRating tyreModel vehicleType width runFlat tyreImage';
                    PartnerTyre.find({ tyreRef: { $in: tyreIds }, partnerRef: { $in: partnerIds }, status: ['Live', 'Pending'], livePrice: { $ne: '0.00' } }, partnerTyreReturn)
                        .populate('partnerRef', partnerReturn)
                        .populate('tyreRef', tyreReturn).exec((err, docs) => {
                            if (err) return next(err);
                            res.send(docs)
                        });
                }
            });
        }
    });
});

/* Static Files */
app.use(express.static(path.join(__dirname, '/dist'))); // Serve only the static files form the dist directory

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
})