//===================================
//Verificar token con next() middelware
//===================================
var SEED = require('../config/config').SEED;
var jwt = require('jsonwebtoken');
exports.verificaToken= function (req,res,next) {


    var token = req.query.token;
    jwt.verify(token,SEED,(err,decoded)=>{
        if(err){
            return res.status(401).json({
                ok:false,
                mensaje: 'Token inválido',
                errors: err                
        });

        }   //En cualquier lugar obtener la información del usuario que mandó la solicitud
            req.Usuario = decoded.usuario;
        next();
        //return res.status(200).json({
        //    ok:true,
        //    mensaje: 'Token válido',
        //    decoded:decoded 
    });

    };
