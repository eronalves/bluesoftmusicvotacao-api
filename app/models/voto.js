var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VotoSchema = new Schema({
    votacao: String,
    idBanda: String,
    nomeBanda: String,    
    votos: Number
});

module.exports = mongoose.model('Voto', VotoSchema);