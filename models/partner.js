var mongoose = require('mongoose');
var Counter = require("../models/counter");
var Schema = mongoose.Schema;

var PartnerSchema = new Schema({
  customerCode: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  },
  retailerName: {
    type: String,
    required: true
  },
  registeredName: {
    type: String,
    required: true
  },
  province: {
    type: String,
    required: true
  },
  suburb: {
    type: String,
    required: true
  },
  branchName: {
    type: String,
    required: true
  },
  branchPin: {
    type: String,
    required: true
  },
  partnerZoneEmail: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  salesEmail: {
    type: String,
    required: true,
    lowercase: true,
  },
  logo: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
});

PartnerSchema.pre('findOneAndUpdate', function(next) {
  var partner = this;
  if (!partner._update.customerCode || partner._update.customerCode == undefined) {
      Counter.findByIdAndUpdate({_id: 'entityId'}, {$inc: { seq: 1} }, {upsert: true}).then(function(count, error)   {
        if(error)
          return next(error);
        partner._update.customerCode = 'TLP' + zeroFill(count.seq, 4);
        next();
    });
  } else{
    next();
  }
});

function zeroFill(number, width) {
  width -= number.toString().length;
  if ( width > 0 ) {
    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
  }
  return number + '' ; // always return a string
}

module.exports = mongoose.model('Partner', PartnerSchema);