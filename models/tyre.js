var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TyreSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  vehicleType: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  tyreModel: {
    type: String,
    required: true
  },
  tyreImage: { 
    data: Buffer, 
    contentType: String,
  },
  width: {
    type: String,
    required: true
  },
  profile: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: true
  },
  runFlat: {
    type: String,
    required: true,
  },
  speedRating: {
    type: String,
    required: false
  },
});

module.exports = mongoose.model('Tyre', TyreSchema);