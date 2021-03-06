const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const nodemailer = require('nodemailer'); 
const smtpTransport = require('nodemailer-smtp-transport');

/* Models */
const Tyre = require('./models/tyre');
const PartnerTyre = require('./models/partnerTyre');
const PartnerService = require('./models/partnerService');
const Partner = require('./models/partner');
const Lead = require('./models/lead');
const Error = require('./models/error');

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

var transporter = nodemailer.createTransport(smtpTransport({
    tls: {
        rejectUnauthorized: false
    },
    service: 'facile',
    host: 'mail.facile.co.za',
    auth: {
      user: 'deals@facile.co.za',
      pass: 'manage-01'
    }
  }));

const uniq = (a) => {
    return Array.from(new Set(a));
}

/* API */
app.get('/api/locationConfig', (req, res, next) => {    /* Get all unique width / profile / size */
    Partner.find({}, 'suburb province', (err, partner) => {
        if (err) return next(err);
        else if (partner) {
            let provinces = [];
            partner.forEach(partner => {
                let province = provinces.filter(e => e.name === partner.province);
                if (province && province.length > 0) {  /* Province exists */
                    let suburb = province[0].sub_locations.filter(e => e.name === partner.suburb);
                    if (!suburb || suburb.length === 0) {
                        province[0].sub_locations.push({
                            name: partner.suburb,
                            checked: false
                        });
                    }
                } else {
                    provinces.push({
                        name: partner.province,
                        checked: false,
                        collapsed: true, 
                        sub_locations: [{
                            name: partner.suburb,
                            checked: false
                        }]
                    });
                }
            });
            provinces.forEach(province => { /* Alphabetical sorting on name */
                province.sub_locations.sort((a, b) => a.name.localeCompare(b.name));
            });
            provinces.sort((a, b) => a.name.localeCompare(b.name));
            res.send(provinces);
        }
    });
});

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

app.get('/api/brandConfig', (req, res, next) => {    /* Get all unique width / profile / size */
    Tyre.find({}, 'brand').exec((err, brands) => {
        if (err) return next(err);
        else if (brands) {
            let uniqBrand = uniq(brands.map(e => e.brand));
            res.send(uniqBrand.sort((a, b) => a.localeCompare(b)).map(e => { 
                return { 'name': e, 'email': e + '.co.za'}
            }));
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
    };
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
                    let partnerServiceReturn = 'liveWheelAlignmentPrice liveWheelBalancingPrice',
                        partnerTyreReturn = 'livePrice liveInclusion',  /* Fields to return */
                        partnerReturn = 'branchName branchPin customerCode logo province retailerName salesEmail suburb',
                        tyreReturn = 'brand profile size speedRating tyreModel vehicleType width runFlat tyreImage';
                    PartnerService.find({ partnerRef: { $in: partnerIds }}, partnerServiceReturn).populate('partnerRef').exec((err, docs) => {
                        if (err) return next(err);
                        else if (docs) {
                            PartnerTyre.find({ tyreRef: { $in: tyreIds }, partnerRef: { $in: partnerIds }, status: ['Live', 'Pending'], livePrice: { $ne: '0.00' } }, partnerTyreReturn)
                            .populate('partnerRef', partnerReturn)
                            .populate('tyreRef', tyreReturn).exec((err, partnerTyres) => {
                                if (err) return next(err);
                                else if (partnerTyres) {
                                    let arr = [];
                                    partnerTyres.forEach(e => {
                                        let o = JSON.parse(JSON.stringify(e));
                                        o.services = docs.filter(d => d.partnerRef._id == o.partnerRef._id)[0];
                                        arr.push(o);
                                    });
                                    res.send(arr);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

app.post('/api/contactMe', (req, res, next) => {    /* Contact Me - Email to partner */
    let mailOptions = {
        from: 'TyreLess.co.za <deals@facile.co.za>',
        to: req.query.recipient,
        bcc: 'leads@facile.co.za',
        subject: req.body.title,
        html: req.body.html
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return next(error);
        } else {
          return res.sendStatus(200);
        }
      });  
});

app.post('/api/lead', (req, res, next) => {    /* Store lead information */
    var lead = new Lead({
        partnerRef: req.body.partnerRef,
        customerEmail: req.body.customerEmail,
        customerMobile: req.body.customerMobile,
        customerName: req.body.customerName,
        description: req.body.description,
    });
    lead.save((err) => {
        if (err) {
            return res.json({ success: false, msg: err.message });
        }
        res.json({ success: true, msg: 'Successful created new lead.' });
    });
});

app.post('/api/error', (req, res, next) => {    /* Store error information */
    var error = new Error({
        technical: req.body.technical,
        business: req.body.business,
    });
    error.save((err) => {
        if (err) {
            return res.json({ success: false, msg: err.message });
        }
        res.json({ success: true, msg: 'Successful added error.' });
    });
});

/* Static Files */
app.use(express.static(path.join(__dirname, '/dist'))); // Serve only the static files form the dist directory

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
})