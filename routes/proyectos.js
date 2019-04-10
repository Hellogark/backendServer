var express = require('express');
var app = express();
const fileUpload = require('express-fileupload');
app.use(fileUpload({
    parseNested: true
}));
var fs = require('fs');
var md5 = require('md5');

var Proyecto = require('../models/proyectos');
var Usuario = require('../models/usuario');
var Archivo = require('../models/archivos');
var Tarea = require('../models/tareas');
var cors = require('cors');
const path = require('path');
var mwAutenticacion = require('../middlewares/autenticacion'); 
const multer = require('multer');


//===================================
//obtener todos los proyectos ADMIN
//===================================
app.get('/',cors({origin:"http://localhost:4200"}),
[mwAutenticacion.verificaToken],
( req, res, next ) => {
    /*Campos a  devolver como segundo parámetro*/ 
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Proyecto.find({})
    .populate('archivos','nombre _id')
    .populate('participantes','nombre img')    
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
//Obtener Proyecto a editar
app.get('/id/:id',cors({origin:"http://localhost:4200"}), ( req, res, next ) => {
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
//OBTENER MIS PORYECTOS
app.get('/misproyectos/:id', cors({origin:"http://localhost:4200"}),mwAutenticacion.verificaToken, (req,res) =>{

var id = req.params.id;
    Proyecto.find({participantes:id})
    .populate('archivos','nombre _id comentario responsable' )
    .populate('participantes','nombre img')
    .populate('responsable', 'nombre')
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
//:id especifica un segmento en la ruta /proyecto/id
app.put('/editarProyecto/:id',cors({origin:"http://localhost:4200"}),[mwAutenticacion.verificaToken],(req,res) =>{
    var id = req.params.id;
    var body = req.body;
    var arregloPart = [];

    
    body.participantes.forEach(element => {
                arregloPart.push(element._id);
        });
       // arregloPart=body.participantes;       
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

//Subir archivo
    app.put('/:id/archivos',cors({origin:"http://localhost:4200"}),[mwAutenticacion.verificaToken],(req,res) =>{
        var idProyecto = req.params.id;
   
        var body = req.body;
        var archivoObj = JSON.parse(body.archivoObj);
        var archivo = req.files.archivos;
       
        var nombreArchivo = archivo.name.split('.');
        var ext = nombreArchivo[nombreArchivo.length - 1];
        var extensionesProyecto = ['rar', 'zip'];
        var encontrado = false;
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
        
   var path = `./uploads/proyectos/${idProyecto}/${nombreFile}`;
    var pathCarpeta = `./uploads/proyectos/${idProyecto}/`;
    if (!fs.existsSync(pathCarpeta)) {
        fs.mkdirSync(pathCarpeta)
    }
    archivo.mv(path, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                errors: {
                    message: 'Error al mover el archivo',    
               } 
            });

        }});
          Proyecto.findById(idProyecto, (err, proyecto) => {
            if (!proyecto) {
                return res.status(400).json({
                    ok: false,                   
                    errors: {
                        message: 'No se encontró un proyecto con ese ID',    
                   } 

                });
            }
            

            var pathViejo = `./uploads/proyectos/${idProyecto}/${proyecto.archivos.nombre}`;
            //Si existe archivo lo elimina
            if (fs.existsSync(pathViejo, (err) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,                           
                            errors: {
                                message: 'Problemas al encontrar el archivo',    
                           } 
                        });
                    }
                   

                })) {

                if (pathViejo != `./uploads/proyectos/${idProyecto}/${proyecto.archivos.nombre}`) {
                    fs.unlinkSync(pathViejo);
                }
            } else {     
               
        var archivoBd = new Archivo({
            nombre: nombreFile,
            responsable:archivoObj.responsable,
            comentario: archivoObj.comentario

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
    }
});                                 
});
 

   ////////////////////////////////////
   //Descargar archvio
   ///////////////////////////////////

    app.get('/:id/descargar/:nombre',cors({origin:"http://localhost:4200"}),mwAutenticacion.verificaToken,(req,res)=>{
        var params = req.params;    
        var id = params.id;
        var nombre = params.nombre;
        var pathArchivo = path.resolve(__dirname,`../uploads/proyectos/${id}/${nombre}`);
        if(!fs.existsSync(pathArchivo)){
             return res.status(400).json({
                    ok:false,
                    errors:{
                        message:'No existe el archivo'
                    }
                });

        }
        res.sendFile(pathArchivo,'Recursos del proyecto', (err) =>{
            if (err) {
                return res.status(400).json({
                    ok:false,
                    errors:{
                        message:'No existe el archivo',
                        err:err
                    }
                });
              }          
              
        })
        

    });
    

//////////////////////////////////
//Eliminar Archivos
/////////////////////////////////
app.delete( '/:idProyecto/archivo/:id',cors({origin:"http://localhost:4200"}),[mwAutenticacion.verificaToken],(req,res)=>{

    var id = req.params.id;
    var idProyecto = req.params.idProyecto;
    Proyecto.findOneAndUpdate({_id:idProyecto}, {$pull: {archivos:id}}, (err,archivo)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al borrar archivo',               
                errors: err                
        }); }
       
        if(!archivo){
            return res.status(400).json({
                ok:false,
                mensaje: 'No existe un archivo con ese id en el proyecto',               
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


//===================================
// Crear los proyectos POST
//===================================
app.post('/:id',cors({origin:"http://localhost:4200"}),[mwAutenticacion.verificaToken],(req, res) =>{
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


app.delete('/:id',cors({origin:"http://localhost:4200"}),[mwAutenticacion.verificaToken],(req,res)=>{
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


////////////////////////////
//Operaciones de tareas
////////////////////////////

app.post('id:/tareas',cors({origin:"http://localhost:4200"}),[mwAutenticacion.verificaToken], (req,res) =>{
    var body = req.body;
    var idProyecto = req.params.id;
    var arregloPart = [];
    var arregloTareas = [];
    var arregloGuardarTareas = [];

    body.tareas.forEach( element =>{
        arregloTareas.push(element);
    });
    body.participantes.forEach(element => {
                arregloPart.push(element._id);
        });

        arregloTareas.forEach( tareas =>{
            var generaTarea = new Tarea({
                nombre: tareas.nombre,
                descripcion: tareas.descripcion,
                fechaFinalizado: tareas.fechaFinalziado,
                finalizado: tareas.finalizado,
                creador: tareas.creador,
                ultimoEditor:tareas.ultimoEditor,
                participantes: arregloPart
            });
           generaTarea.save( (err,res) =>{
            if(err){
                return res.status(400).json({
                    ok:false,
                    mensaje: 'Error al crear el o las tareas',
                    errors: err                
            }); }
    
            res.status(201).json({
                ok:true,
                tareas: res,            
        });
           });
        });
   

});
module.exports = app;