var SEED = require('../config/config').SEED;
var jwt = require('jsonwebtoken');

/**
* Middleware para verificación del token del usuario
*/
exports.verificaToken= function (req,res,next) {
    var token = req.query.token;

    jwt.verify(token,SEED,(err,decoded)=>{
        if(err){
            return res.status(401).json({
                ok:false,
                mensaje: 'Token inválido',
                errors: err                
        });
        }  
         //En cualquier lugar obtener la información del usuario que mandó la solicitud
        req.Usuario = decoded.usuario; 
        next();
                           
    });

    };

    //VerificaAdmin
    exports.verificaRol= function (req,res,next) {

        var usuario = req.Usuario;
        console.log(usuario);
       
        if(usuario.role === 'ADMIN_ROLE'){
        next();
        return;
        }else{
            return res.status(401).json({
                ok:false,
                mensaje: 'Usuario no permitido',
                errors: {message: 'Usuario no permitido'}                
        });
        }
       };

        //VerificaAdmin o mismo usuarios
    exports.verificaAdmin_Usuario= function (req,res,next) {

        var usuario = req.Usuario;
        var id = req.params.id;
        console.log(usuario);
        if(usuario.role === 'ADMIN_ROLE' || usuario._id === id ){
        next();
        return;
        }else{
            return res.status(401).json({
                ok:false,
                mensaje: 'Usuario no permitido',
                errors: {message: 'Usuario no permitido'}                
        });
        }
       
    };