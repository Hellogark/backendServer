var express = require('express');
var app = express();
 var Usuario = require('../models/usuario');
 var fs = require('fs');
 var rimraf = require("rimraf");
 var mwAutenticacion = require('../middlewares/autenticacion');  
 var cors = require('cors');


 var bcrypt = require('bcryptjs');
//===================================
//obtener los usuarios
//===================================
/**
 * 
 * @api {GET} usuario/ Obtener usuarios
 * @apiName Obtener usuarios
 * @apiGroup Usuarios
 * 
 * @apiSuccess (200) {json} usuarios Devuelve todos los usuarios
 * @apiError (500) {json} ErrorCargandoUsuarios Error al momento de cargar usuarios
 * 
 * 
 */
app.get('/' ,[mwAutenticacion.verificaToken],( req, res, next ) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Usuario.find({}, 'nombre correo img role empresa activo')
    .sort({nombre: 1})
    .skip(desde)
    
    /*Campos a  devolver como segundo parámetro*/ 
        .exec(
        
        
        (err,usuarios) =>{
        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error cargando usuarios',
                errors: err                
        }); }
        Usuario.countDocuments({}, (err,conteo) =>{

        
            res.status(200).json({
                ok:true,
                total: conteo ,
                usuarios   
            });
         });

        });
});

/**
 * 
 * @api {POST} / Crear usuario
 * @apiName Crear usuario
 * @apiGroup Usuarios
 * @apiSuccess (201) {json} UsuarioCreado Devuelve el usuario creado
 * @apiError (400) {json} ErrorCreandoUsuario Error al momento de crear un usuario
 * 
 */
//===================================
// Crear los usuarios POST
//===================================
app.post('/' ,(req, res) =>{
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        correo: body.correo,
        password: bcrypt.hashSync(body.password,10),
        img: body.img,
        role: body.role,
        empresa: body.empresa,
        activo: false


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
    });    

    });
});

//===================================
//Actualizar usuario
//===================================

/**
 * 
 * @api {PUT} usuario/:id Actualziar Usuario (Perfil)
 * @apiName Actualizar Usuario
 * @apiGroup Usuarios
 * @apiParam  {String} id id del usuario a actualizar
 * 
 * @apiSuccess (200) {json} UsuarioActualizado Devuelve el usuario actualizado
 * @apiError (400) {json} ErrorActualizandoUsuario Error al actualizar el usuario
 * @apiError (400) {json} PasswordIncorrecto EL password introducido para actualizar es incorrecto
 * @apiError (400) {json} UsuarioInexistente Usuario con el id no existe
 * @apiError (500) {json} ErrorBuscandoUsuario Error al buscar el usuario
 * 
 */
app.put('/:id',mwAutenticacion.verificaToken ,(req,res) =>{
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
        usuario.empresa=usuario.empresa;
        if( body.passwordAnterior){ 
               
         if( !bcrypt.compareSync( body.passwordAnterior, usuario.password) ){
             
                return res.status(400).json({
                    ok:false,
                    mensaje: 'Contraseña incorrecta',
                    errors:err
                });
            } 
        usuario.password = bcrypt.hashSync(body.password,10);
        }   
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
/**
 * 
 * @api {PUT} usuario/editarUsuario/:id Editar usuarios
 * @apiName Editar Usuario
 * @apiGroup Usuarios
 * @apiParam  {String} id id del usuario a editar
 * 
 * @apiSuccess (200) {json} name description
 * @apiError (400) {json} ErrorActualizandoUsuario Error al momento de actualizar el usuario
 * @apiError (400) {json} UsuarioInexistente Usuario con el id no existe
 * @apiError (500) {json} ErrorBuscandoUsuario Error al buscar el usuario
 * 
 */
//===================================
//editar ususarios por id
//===================================
app.put('/editarUsuario/:id',[mwAutenticacion.verificaToken] ,(req,res) =>{
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
         
       
        usuario.activo = body.activo;
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

/**
 * 
 * @api {DELETE} usuario/:id Eliminar Usuario
 * @apiName EliminarUsuario
 * @apiGroup Usuarios
 * 
 * 
 * @apiParam  {String} id id del usuario a eliminar
 * 
 * @apiSuccess (200) {json} UsuarioEliminado Devuelve el usuario eliminado
 * @apiError (400) {json} ErrorEliminandoDatosDelUsuario Error al momento de eliminar los archivos pertenecientes al usuario
 * @apiError (400) {json} UsuarioInexistente Usuario con el id no existe

 * @apiError (500) {json} ErrorEliminandoUsuario Error al eliminar el usuario
 */

app.delete('/:id'  ,mwAutenticacion.verificaToken,(req,res)=>{
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
            var path = `./uploads/usuarios/${id}`;
            if(fs.existsSync(path),(err)=>{
                if(err){
                    return res.status(400).json({
                        ok:false,
                        mensaje: 'Problema al eliminar el contenido del usuario',
                        error:err
                    })
                }
                rimraf(path, () =>{
                    console.log('Carpeta eliminada');
                });


            })
            res.status(200).json({
                ok: true,
                usuario: usuarioBorrado
            });
        });
});

module.exports = app;