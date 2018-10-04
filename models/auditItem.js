var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AuditItemSchema = new Schema({
    description: {
        type: String,
        required: true
    },
    payload: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    userRef: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    affectedRef: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
});

module.exports = mongoose.model('AuditItem', AuditItemSchema);