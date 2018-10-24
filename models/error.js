var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ErrorSchema = new Schema({
    date: {
        type: Date,
        default: Date.now,
    },
    technical: {
        type: String,
        required: true,
    },
    business: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Error', ErrorSchema);