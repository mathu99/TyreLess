var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LeadSchema = new Schema({
    date: {
        type: Date,
        default: Date.now,
    },
    partnerRef: {
        type: Schema.Types.ObjectId,
        ref: 'Partner',
        required: true,
    },
    customerEmail: {
        type: String,
    },
    customerMobile: {
        type: String,
    },
    customerName: {
        type: String,
    },
    description: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Lead', LeadSchema);