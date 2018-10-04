var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InclusionSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
});

module.exports = mongoose.model('Inclusion', InclusionSchema);