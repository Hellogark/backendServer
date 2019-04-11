var express = require('express');

var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');

var app = express();
var cors = require('cors');
var SEED = require('../config/config').SEED;

var Usuario = require('../models/usuario.js');
var mwAutenticacion = require('../middlewares/autenticacion');

//=================================
//Renovar Token
//=================================

app.get('/renuevatoken',cors({origin:"http://localhost:4200"}),mwAutenticacion.verificaToken, (req , res) =>{
    var token = jwt.sign({usuario: req.usuario}, SEED,{expiresIn:'1h'});

    res.status(200).json({
        ok:true,    
        token:token

    });

} );



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
                mensaje: 'Credenciales incorrectas',
                errors:err
            });
        }
        if( !bcrypt.compareSync(body.password, usuarioDB.password) ){
            return res.status(400).json({
                ok:false,
                mensaje: 'Credenciales incorrectas',
                errors:err
            });
        }
        if(usuarioDB.activo == false){
            return res.status(400).json({
                ok:false,
                mensaje: 'El usuario no ha sido dado de alta',
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
            id: usuarioDB._id,      
            menu: obtenerMenu(usuarioDB.role)          
            });
    });
   
});

    function obtenerMenu( ROLE){
        menu = [
            {
              titulo: 'Principal',
              icono: 'mdi mdi-gauge',
              submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo : 'Proyectos en los que participo', url: '/misproyectos' },   
                { titulo: 'Mis tareas', url: '/mistareas' }                                                    
              ]
            },
          ];

          if(ROLE === 'ADMIN_ROLE'){
            menu.push({
                titulo: 'Acciones Admin...',      
                icono: 'mdi mdi-folder-lock-open',
                submenu:[
                  {titulo: 'Ver usuarios', url:'/ver-usuarios'},
                  {titulo: 'Ver todos los proyectos',url:'/ver-proyectos'},
                  { titulo: 'Crear Proyecto', url: '/nuevoProyecto' }
          
          
                ]
          
          
              });

          }
          return menu;
    }

module.exports = app;