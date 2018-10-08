var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PartnerServiceSchema = new Schema({
  userRef: {
      type: Schema.Types.ObjectId,
      ref: 'User',
  },
  partnerRef: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
  },
  wheelAlignmentPrice: {
    type: String,
    required: true
  },
  liveWheelAlignmentPrice: {
    type: String,
    required: true
  },
  wheelBalancingPrice: {
    type: String,
    required: true
  },
  liveWheelBalancingPrice: {
    type: String,
    required: true
  },
  reviewPending: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('PartnerService', PartnerServiceSchema);