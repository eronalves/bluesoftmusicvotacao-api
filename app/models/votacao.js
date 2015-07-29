var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VotacaoSchema = new Schema({
    nome: String,
    email: String,
    data: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Votacao', VotacaoSchema);