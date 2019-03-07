var express = require('express');
var app = express();
 var Usuario = require('../models/usuario');
 var mwAutenticacion = require('../middlewares/autenticacion');  
 var jwt = require('jsonwebtoken');
 var cors = require('cors');


 var bcrypt = require('bcryptjs');
//===================================
//obtener los usuarios
//===================================
app.get('/',cors({origin:"http://localhost:4200"}),( req, res, next ) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Usuario.find({}, 'nombre correo img role')
    .skip(desde)
    .limit(3)/*Campos a  devolver como segundo parámetro*/ 
        .exec(
        
        
        (err,usuarios) =>{
        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error cargando usuarios',
                errors: err                
        }); }
        Usuario.count({}, (err,conteo) =>{

        
            res.status(200).json({
                ok:true,
                total: conteo ,
                usuarios   
            });
         });

        });
});


//===================================
// Crear los usuarios POST
//===================================
app.post('/',cors({origin:"http://localhost:4200"}),(req, res) =>{
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        correo: body.correo,
        password: bcrypt.hashSync(body.password,10),
        img: body.img,
        role: body.role


    });

    usuario.save( (err, usuarioGuardado) =>{
        if(err){
            return res.status(400).json({
                ok:false,
                mensaje: 'Error al crear usuario',
                errors: err                
        }); }

        res.status(201).json({
            ok:true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
    });
    res.status(200).json({
        ok:true,
        body   
    });

    });
});

//===================================
//Actualizar los usuarios
//===================================
//:id especifica un segmento en la ruta /usuario/id
app.put('/:id',mwAutenticacion.verificaToken,(req,res) =>{
    var id = req.params.id;
    var body = req.body;
    Usuario.findById(id, (err, usuario) =>{
   

        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al buscar usuario',               
                errors: err                
        }); }
        if(!usuario){
            return res.status(400).json({
                ok:false,
                mensaje: 'Error el usuario con el id '+id+' no existe',               
                errors: {message: 'No existe un usuario con este ID '}  

                }
            );
        }
        usuario.nombre = body.nombre;
        usuario.correo = body.correo;
        usuario.role = body.role; 
        usuario.save( (err,usuarioGuardado ) =>{
                
            if(err){
                return res.status(400).json({
                    ok:false,
                    mensaje: 'Error al actualizar usuario',               
                    errors: err                
            }); }
            usuarioGuardado.password = ':v';
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });
    });


});

//===================================
//Eliminar ususarios por id
//===================================


app.delete('/:id', mwAutenticacion.verificaToken,(req,res)=>{
        var id = req.params.id;
        Usuario.findByIdAndRemove(id,(err, usuarioBorrado)=>{
     
            if(err){
                return res.status(500).json({
                    ok:false,
                    mensaje: 'Error al borrar usuario',               
                    errors: err                
            }); }
           
            if(!usuarioBorrado){
                return res.status(400).json({
                    ok:false,
                    mensaje: 'No existe un usuario con ese id',               
                    errors: {message: 'No existe un usuario con ese id'}                
            }); }
            res.status(200).json({
                ok: true,
                usuario: usuarioBorrado
            });
        });
});
module.exports = app;