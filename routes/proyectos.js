var express = require('express');
var app = express();
const fileUpload = require('express-fileupload');
app.use(fileUpload({
    parseNested: true
}));
var cloudinary = require('cloudinary').v2;
var fs = require('fs');
var md5 = require('md5');
var subirArchivo = require('../modules/func_Cloudinary');
var Proyecto = require('../models/proyectos');
var Archivo = require('../models/archivos');
var mwAutenticacion = require('../middlewares/autenticacion'); 


//===================================
//obtener todos los proyectos ADMIN
//===================================
/**
 * 
 * @api {GET} proyectos/ Obtener todos los proyectos
 * @apiName Obtener todos los proyectos
 * @apiGroup Proyectos
 * 
 * @apiSuccess (200) {json} ProyetosEncontrados Envía los proyectos encontrados 
 * @apiError (500) {json} ErrorCargandopProyectos Error al cargar los proyectos desde el servidor
 * 
 */
app.get('/' ,
[mwAutenticacion.verificaToken],
( req, res, next ) => {
    /*Campos a  devolver como segundo parámetro*/ 
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Proyecto.find({})
    .populate('archivos','nombre _id')
    .populate('participantes','nombre img')  
    .sort({nombre: 1})  
    .exec(
        (err,proyectos) =>{
        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error cargando proyectos',
                errors: err                
        }); }
        
        Proyecto.countDocuments({}, (err,conteo) =>{

        
            res.status(200).json({
                ok:true,
                total: conteo ,
                proyectos   
            });
         });

        });
});
/**
 * 
 * @api {GET} proyectos/id/:id Obtener proyecto a editar
 * @apiName Editar Proyecto
 * @apiGroup Proyectos
 * @apiParam  {String} id id del proyecto a editar
 * @apiSuccess (200) {json} ProyectoAEditar Devuelve los datos del proyecto a editar 
 * @apiError (400) {json} ProyectoNoEncontrado Error si no se encontró el proeycto en la base de datos
 * @apiError (500) {json} ErrorAlBuscarProeycto Error al momento de buscar el proyecto
 * 
 * 
 */
//Obtener Proyecto a editar
app.get('/id/:id' , ( req, res, next ) => {
    /*Campos a  devolver como segundo parámetro*/ 
    var id = req.params.id;
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Proyecto.findById(id)
    .populate('archivos','nombre _id comentario responsable')
    .populate({path: 'archivos', populate: {path: 'responsable'}})
    .populate('participantes','nombre empresa')    
    .populate('responsable', 'nombre')
    .exec(
        (err,proyecto) =>{
        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al buscar proyecto',
                errors: err                
        }); }

        if(!proyecto){
            return res.status(400).json({
                ok: false,
                mensaje:'No existe el proyecto'            
            });

        }
        
        Proyecto.countDocuments({}, (err,conteo) =>{

        
            res.status(200).json({
                ok:true,
                total: conteo ,
                proyecto:proyecto  
            });
         });

     
        

        });
});
//======================================
//Obtener proyectos en los que participo
//======================================
/**
 * 
 * @api {GET} proeyctos/misproyectos/:id Obtener mis proyectos
 * @apiName Mis Proyectos
 * @apiGroup Proyectos
 * @apiParam  {String} id id del usuario
 * @apiSuccess (200) {json} MisProyectos Devuelve un json con la información de los proyectos en los que participa el usuario
 * @apiError (500) {json} ErrorBuscando Error mientras se buscaba el proyecto
 * 
 * 
 */
app.get('/misproyectos/:id'  ,mwAutenticacion.verificaToken, (req,res) =>{

var id = req.params.id;
    Proyecto.find({participantes:id})
    .populate('archivos','nombre _id comentario responsable' )
    .populate('participantes','nombre img')
    .populate('responsable', 'nombre')
    .sort({nombre: 1})
    .exec( (err,proyectos) =>{
       
        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error cargando proyectos',
                errors: err                
        }); }
        
        Proyecto.countDocuments({}, (err,conteo) =>{

        
            res.status(200).json({
                ok:true,
                total: conteo ,
                proyectos   
            });
         });

    });
});
//===================================
//Actualizar los proyectos
//===================================

/**
 * 
 * @api {PUT} proyectos/editarProyecto/:id Editar Proyecto
 * @apiName Editar Proyecto
 * @apiGroup Proyectos
 * @apiParam  {String} id id del proyecto a editar
 * 
 * @apiSuccess (200) {json} ProyectoEditado Devuelve el proyecto editado
 * @apiError (400) {json} ProyectoNoEncontrado Error si no se enconró el proyecto buscado en la base de datos
 * @apiError (500) {json} ErrorAlBuscarProyecto Error al momento de buscar el proyecto
 * 
 */
app.put('/editarProyecto/:id' ,[mwAutenticacion.verificaToken],(req,res) =>{
    var id = req.params.id;
    var body = req.body;
    var arregloPart = [];

    
    body.participantes.forEach(element => {
                arregloPart.push(element._id);
        });
            
    Proyecto.findById(id, (err, proyecto) =>{

   

        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al buscar proyecto',               
                errors: err                
        }); }
        if(!proyecto){
            return res.status(400).json({
                ok:false,
                mensaje: 'Error el proyecto con el id '+id+' no existe',               
                errors: {message: 'No existe un proyecto con este ID '}  

                }
            );
        }
        proyecto.nombre = body.nombre;
        proyecto.descripcion = body.descripcion;
        proyecto.participantes = arregloPart;
        proyecto.fechaProyectada = body.fechaProyectada;
        proyecto.nombreEmpresa = body.nombreEmpresa;
        proyecto.responsable = body.responsable;
        proyecto.ultimoEditor = body.ultimoEditor;
        proyecto.save( (err,proyectoGuardado ) =>{
                
            if(err){
                return res.status(400).json({
                    ok:false,
                    mensaje: 'Error al actualizar proyecto',               
                    errors: err                
            }); }
            
            res.status(200).json({
                ok: true,
                proyecto: proyectoGuardado
            });

        });
    });


});
/**
 * 
 * @api {POST} proyectos/:id Crear Proyecto
 * @apiName Crear proyecto
 * @apiGroup Proyectos
 * @apiParam  {String} id id del usuario
 * @apiSuccess (200) {json} ProyectoCreado Regresa el proyecto que ha sido creado
 * @apiError (400) {json} ErrorCreandoProyecto Error al crear el proyecto
 * 
 */

//===================================
// Crear los proyectos POST
//===================================
app.post('/:id' ,[mwAutenticacion.verificaToken],(req, res) =>{
    var body = req.body;
    var id = req.params.id;
    var proyecto = new Proyecto({
        nombre: body.nombre,
        descripcion: body.descripcion,
        fechaCreacion: body.fechaCreacion,
        nombreEmpresa: body.nombreEmpresa,
        responsable: id
    });

    proyecto.save( (err, proyectoGuardado) =>{
        if(err){
            return res.status(400).json({
                ok:false,
                mensaje: 'Error al crear proyecto',
                errors: err                
        }); }

        res.status(201).json({
            ok:true,
            proyecto: proyectoGuardado,            
    });
    

    });
});


//===================================
//Eliminar proyectos por id
//===================================

/**
 * 
 * @api {DELETE} proyectos/:id Eliminar Proyecto
 * @apiName Eliminar Proyecto
 * @apiGroup Proyectos 
 * @apiParam  {String} id id del proyecto a eliminar
 * @apiSuccess (200) {json} ProyectoEliminado Regresa el proyecto que ha sido eliminado
 * @apiError (400) {json} ProyectoInexistente Error al encontrar el archivo en la base de datos
 * @apiError (500) {json} ErrorEliminandoProyecto Error al eliminar el proyecto
 * 
 * 
 */
app.delete('/:id' ,[mwAutenticacion.verificaToken], (req,res) =>{
        var id = req.params.id;
        Proyecto.findByIdAndRemove(id,(err, proyectoBorrado)=>{
     
            if(err){
                return res.status(500).json({
                    ok:false,
                    mensaje: 'Error al borrar proyecto',               
                    errors: err                
            }); }
           
            if(!proyectoBorrado){
                return res.status(400).json({
                    ok:false,
                    mensaje: 'No existe un proyecto con ese id',               
                    errors: {message: 'No existe un proyecto con ese id'}                
            }); }
            res.status(200).json({
                ok: true,
                proyecto: proyectoBorrado
            });
        });
});
//////////////////
//Subir archivo
//////////////////
/**
 * 
 * @api {PUT} proyectos/:id/archivos Subir archivo al servidor y registrar en la base de datos
 * @apiName Subir archivo
 * @apiGroup Archivos
 * @apiParam  {String} id id del proyecto para el cual se subirá y registrará el archivo
 * @apiSuccess (200) {json} ArchivoSubidoCorrectamente Devuelve un mensaje al completarse la subida del archivo
 * @apiError (400) {json} ArchivoInvalido Error si el archivo es inválido
 * @apiError (400) {json} ErrorAlBuscarArchivo Error al momento de buscar del archivo
 * @apiError (409) {json} ArchivoYaExistente Error si el archivo subido ya existe con el mismo nombre
 * @apiError (400) {json} ErrorAlBuscarProyecto Error al momento de buscar el proyecto en la base de datos
 * @apiError (400) {json} ErrorRegistrandoElArchivo Error al momento de registrar el archivo en la base de datos
 * @apiError (400) {json} ErrorRelacionandoElArchivo Error al momento de añadir el archivo al proyecto
 * @apiError (500) {json} ErrorMoviendoElArchivo Error al momento de mover el archivo en el servidor a la carpeta correspondiente  
 */
    app.put('/:id/archivos' ,[mwAutenticacion.verificaToken],(req,res) =>{
        var idProyecto = req.params.id;
   
        var body = req.body;
        var archivoObj = JSON.parse(body.archivoObj);
        var archivo = req.files.archivos;
      
        var nombreArchivo = archivo.name.split('.');
        var ext = nombreArchivo[nombreArchivo.length - 1];
        var extensionesProyecto = ['rar', 'zip'];
        if(extensionesProyecto.indexOf(ext.toLowerCase()) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El archivo seleccionado no es válido',
            errors: {
                message: 'Archivo no válido'
            }
        });
    }
    var nombreFile = `${md5(nombreArchivo[0])}.${ext.toLowerCase()}`;
    
    Archivo.findOne({nombre:nombreFile}).maxTime(3000)    
    .exec((err,archivo )=>{
       
        if(err){
            return res.status(400).json({
                ok:false,
                          
                errors: {
                     message: 'Hubo un error con el archivo',    
                } 
            });
        }
        if(archivo){             
            if( archivo.nombre === nombreFile ){              
                return res.status(409).json({
                    ok:false,
                     errors: {
                     message: 'El archivo con ese nombre ya existe, intente con uno nuevo o renombre el archivo a subir'
                    }

                });
                
            }
        } })
     subirArchivo.subirCloud(idProyecto,nombreFile,archivo,"proyectos",ext,res);   

          Proyecto.findById(idProyecto, (err, proyecto) => {
            if (!proyecto) {
                return res.status(400).json({
                    ok: false,                   
                    errors: {
                        message: 'No se encontró un proyecto con ese ID',    
                   } 

                });
            }
     
        var archivoBd = new Archivo({
            nombre: nombreFile,
            responsable:archivoObj.responsable,
            comentario: archivoObj.comentario,
            archivoURL: `https://res.cloudinary.com/dinamycstest/raw/upload/fl_attachment/proyectos/${idProyecto}/${nombreFile}`

        });

        archivoBd.save((err, resp) => {
            
             if (err) {
                        return res.status(400).json({
                            ok: false,                         
                            errors: {
                                message: 'Error al guardar el archivo en la base de datos',    
                           } 
                        });
                    }         
                  
                   
                Proyecto.findOneAndUpdate({_id:idProyecto},{$push:{archivos:resp._id}},{new:true}, (err,respuesta)=>{
                    if(err){
                        return res.status(400).json({
                            ok: false,                         
                            errors: {
                                message: 'Error al actualizar el proyecto',    
                           } 
                        });

                    }                
                });
                res.status(200).json({
                    ok: true,
                    mensaje: 'Archivo subido correctamente'
                });
        
        });
    });
});
    
                                

 

   

    /**
     * 
     * @api {DELETE} proyectos/:idProyecto/archivo/:id Eliminar Archivo
     * @apiName Eliminar Archivo del proyecto
     * @apiGroup Archivos
     * @apiParam  {String} idProyecto id del proyecto el cual pertenece el archivo
     * @apiParam  {String} id id del archivo a eliminar
     * @apiSuccess (200) {object} ArchivoEliminado Envía el archivo que ha sido eliminado
     * @apiError (400) {json} ArchivoInexistente  El archivo con el id no existe en la base de datos
     * @apiError (400) {json} ProeyctoInexistente El proyecto con ese id no existe en la base de datos
     * @apiError (500) {json} ErrorAlEliminarArchivo Error al momento de eliminar el archivo
     * @apiError (500) {json} ErrorEncontrandoProyecto Error al momento de encontrar el proyecto
     * 
     */
//////////////////////////////////
//Eliminar Archivos
/////////////////////////////////
app.delete( '/:idProyecto/archivo/:id' ,[mwAutenticacion.verificaToken], async (req,res)=>{
    var body =  req.body;
    var params = req.params;
    var id = params.id;
    var idProyecto = params.idProyecto;
    var public_id = `proyectos/${idProyecto}/${body.archivo.nombre}`;
    console.log(public_id);
    try {
        
        await cloudinary.uploader.destroy(public_id,  {invalidate: true, resource_type: "raw"}, function (err, res) {
                 if(err){
                     console.log(err);
                     return res.status(400).json({
                         ok:false,
                         mensaje: 'Hubo un problema al eliminar el archivo',
                         errors:err
                     })
                 }
                 console.log(res);
     
         })
    } catch (error) {
        console.log(error)       
    }
   
    Proyecto.findOneAndUpdate({_id:idProyecto}, {$pull: {archivos:id}}, (err,proyecto)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al encontrar el proyecto',               
                errors: err                
        }); }
       
        if(!proyecto){
            return res.status(400).json({
                ok:false,
                mensaje: 'No existe un proyecto con ese id',               
                errors: {message: 'No existe un archivo con ese id'}                
        }); }
        Archivo.findByIdAndRemove(id,(err, archivoBorrado)=>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    mensaje: 'Error al borrar archivo',               
                    errors: err                
            }); }
           
            if(!archivoBorrado){
                return res.status(400).json({
                    ok:false,
                    mensaje: 'No existe un archivo con ese id',               
                    errors: {message: 'No existe un archivo con ese id'}                
            }); }
            res.status(200).json({
                ok: true,
                proyecto: archivoBorrado
            });
        });

        
    });
 
   

});






module.exports = app;