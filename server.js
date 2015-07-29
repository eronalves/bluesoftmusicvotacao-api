var mongoose = require('mongoose');
mongoose.connect('mongodb://ealves:bluesoft@ds053658.mongolab.com:53658/bluesoftvotacao');

var Votacao = require('./app/models/votacao');
var Voto = require('./app/models/voto');

var express    = require('express');
var app        = express();         
var bodyParser = require('body-parser');
var cors = require('cors');
var async = require('async');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

var port = process.env.PORT || 8081;        

var router = express.Router();            

router.use(function(req, res, next){
    console.log('Something is happening.');
    next();
});

router.get('/', function(req, res) {
    res.json({ message: 'Bem-vindo a api de Votação da Bluesoft Music!' });   
});

router.route('/votacao')
    .post(function(req, res){
        Votacao.findOne({email: '' + req.body.email}, function(err,obj) { 
            if(err)
                res.send(err);
            console.log('encontrou');
            if(obj){
                console.log('error');
                res.status(400).send('E-mail já utilizado para votação');
                return;
            }
        });    
    
        if(!(res.status == 400)){
            var VotacaoObj = new Votacao();
            VotacaoObj.nome = req.body.nome;
            VotacaoObj.email = req.body.email;

            var id = VotacaoObj._id;
            VotacaoObj.save(function(err, obj){
                if(err)
                    res.send(err);  

            });        

            if(id){
                async.each(req.body.votos, function(voto, callback){                                            
                    var VotoObj = new Voto();
                    VotoObj.votacao = id;
                    VotoObj.idBanda = voto._id;
                    VotoObj.nomeBanda = voto.nome;
                    VotoObj.votos = voto.votos;

                    VotoObj.save(function(err){
                        if(err)
                            res.send(err);  

                        callback();
                    });

                });
            }

            res.json({message: 'Votação inserida!'}); 
        }
});

router.route('/rankingVotacao')
    .get(function(req, res){                           
        Voto.aggregate(                    
            { $group: { _id: '$nomeBanda', votos: { $sum: '$votos' }}}, 
            { $project: { _id: 1, votos: 1 }}, 
            { $sort : { votos : -1, posts: 1 } },
            function(err, votos) {
                if(err){
                    res.send(err);
                }

                res.json(votos);
            }
        );                 
    });

router.route('/rankingUltimaVotacao')
    .get(function(req, res){
        Votacao.findOne().sort({ field: 'asc', _id: -1 }).limit(1) // Retornar último registro
            .exec(function(err, votacao){ 
                if(err)
                    res.send(err);

                Voto.aggregate(     
                    { $match : { votacao : '' + votacao._id } }, // Forçando cast para String.
                    { $group: { _id: '$nomeBanda', votos: { $sum: '$votos' }}}, 
                    { $project: { _id: 1, votos: 1 }}, 
                    { $sort : { votos : -1, posts: 1 } },
                    function(err, votos) {
                        if(err){
                            res.send(err);
                        }
                        
                        var sendVotacao = { 
                                            votacao: votacao,
                                            votos: votos
                                          };                        
                        res.json(sendVotacao);
                    }
                );

            });


    });

app.use('/api', router);

app.listen(port);
console.log('Magic happens on port ' + port);