var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PartnerTyreSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    userRef: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    partnerRef: {
        type: Schema.Types.ObjectId,
        ref: 'Partner',
    },
    tyreRef: {
        type: Schema.Types.ObjectId,
        ref: 'Tyre',
    },
    livePrice: { 
        type: String,
        default: '0.00',
        required: true
    },
    price: { 
        type: String,
        default: '0.00',
        required: true,
    },
    inclusion: [{
        type: String
    }],
    liveInclusion: [{
        type: String
    }],
    status: {
        type: String,
        required: true,
        default: 'New',
    },
    modified: {
        type: Boolean,
        default: false,
    }
});

module.exports = mongoose.model('PartnerTyre', PartnerTyreSchema);