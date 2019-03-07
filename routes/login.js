var express = require('express');

var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');

var app = express();
var cors = require('cors');
var SEED = require('../config/config').SEED;

var Usuario = require('../models/usuario.js');



app.post('/' ,cors({origin:"http://localhost:4200"}),(req, res) =>{
    
    var body = req.body;
    Usuario.findOne({correo: body.correo}, (err,usuarioDB)=>{
     

        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al buscar usuarios',
                errors: err                
        }); }

        if(!usuarioDB){
            return res.status(400).json({
                ok:false,
                mensaje: 'Credenciales incorrectas-email',
                errors:err
            });
        }
        if( !bcrypt.compareSync(body.password, usuarioDB.password) ){
            return res.status(400).json({
                ok:false,
                mensaje: 'Credenciales incorrectas-password',
                errors:err
            });
        }

        //Crear token
        usuarioDB.password=':v'
        var token = jwt.sign({usuario: usuarioDB}, SEED,{expiresIn:'1h'});

        res.status(200).json({
            ok:true,
            mensaje: 'Login correcto',
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id                
            });
    });
   
});


module.exports = app;