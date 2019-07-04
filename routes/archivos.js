var express = require('express');
var app = express();
var Archivos = require('../models/archivos');
var mwAutenticacion = require('../middlewares/autenticacion'); 
//===================================
//obtener los archivos
//===================================

/**
 * 
 * @api {GET} archivos/ Obtener todos los archivos
 * @apiName Obtener todos los archivos
 * @apiGroup Archivos
 * @apiSuccess (200) {json} archivos Devuelve todos los archivos de la base de datos
 * @apiError (500) {json} err Error cargando archivos
 */
app.get('/',( req, res, next ) => {
    /*Campos a  devolver como segundo parámetro*/ 
    Archivos.find({} ).populate('usuarios', 'nombre correo')
    .populate('proyecto')   
        .exec(
        
        
        (err,archivos) =>{
        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error cargando archivos',
                errors: err                
        }); }
        Archivos.count({}, (err,conteo) =>{

        
            res.status(200).json({
                ok:true,
                total: conteo ,
                archivos   
            });
         });

       
        

        });
});

/**
 * 
 * @api {POST} archivos/ Registrar archivos
 * @apiName Registrar archivo subido
 * @apiGroup Archivos
 * @apiSuccess (200) {json} archivoGuardado Objeto con los datos del archivo guardado
 * @apiError (400) {json} err Error al crear archivo 
 */
//===================================
// Crear los archivos en la base de datos POST
//===================================
app.post('/',mwAutenticacion.verificaToken,(req, res) =>{
    var body = req.body;
    console.log(body);
    var archivo = new Archivos({
        nombre: body.nombre,       
        fechaCreacion: body.fechaCreacion,
        fechaModificado: body.fechaModificado,
        responsable: req.Usuario._id,
        proyecto: body.proyecto 
        /*EL proyecto es el nombre del atributo proyecto de archivo module*/
        
    });

    archivo.save( (err, archivoGuardado) =>{
        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al crear archivo',
                errors: err                
        }); }

        res.status(201).json({
            ok:true,
            archivo: archivoGuardado
           
    });    

    });
});
/**
 * 
 * @api {PUT} archivos/:id Actualizar archivos
 * @apiName Actualizar archivos
 * @apiGroup Archivos
 * @apiParam  {String} id id del archivo a modificar
 * @apiSuccess (200) {json} archivoGuardado Objeto que devuelve al actualizar el archivo
 * @apiError (500) {json} errorBuscandoArchivo Error al buscar archivo
 * @apiError (400) {json} archivoNoEncontrado Error el archivo con el id  no existe
 * @apiError (400) {json} errorActualizandoArchivo Error al actualizar el archivo
 */
//===================================
//Actualizar los archivos
//===================================
//:id especifica un segmento en la ruta /archivo/id
app.put('/:id',mwAutenticacion.verificaToken,(req,res) =>{
    var id = req.params.id;
    var body = req.body;
    Archivos.findById(id, (err, archivo) =>{
   

        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al buscar archivo',               
                errors: err                
        }); }
        if(!archivo){
            return res.status(400).json({
                ok:false,
                mensaje: 'Error el archivo con el id '+id+' no existe',               
                errors: {message: 'No existe un archivo con este ID '}  

                }
            );
        }
        archivo.nombre = body.nombre;        
        archivo.fechaModificado = body.fechaModificado; 
        archivo.proyecto = body.proyecto;
        archivo.responsable = req.Usuario._id;
        archivo.save( (err,archivoGuardado ) =>{
                
            if(err){
                return res.status(400).json({
                    ok:false,
                    mensaje: 'Error al actualizar archivo',               
                    errors: err                
            }); }
            
            res.status(200).json({
                ok: true,
                archivo: archivoGuardado
            });

        });
    });


});

//===================================
//Eliminar archivos por id
//===================================

/**
 * 
 * @api {DELETE} archivos/:id Eliminar archivo
 * @apiName Eliminar archivo de la base de datos
 * @apiGroup Archivos
 * 
 * 
 * @apiParam  {String} id id del archivo a eliminar
 * 
 * @apiSuccess (200) {json} archivoBorrado Objeto devuelto al eliminar archivo de la base de datos
 * @apiError (500) {json} errorBorrandoArchivo Error al borrar el archivo
 * @apiError (400) {json} errorBuscandoArchivo No existe un archivo con ese id
 * 
 * 
 */
app.delete('/:id', mwAutenticacion.verificaToken,(req,res)=>{
        var id = req.params.id;
        Archivos.findByIdAndRemove(id,(err, archivoBorrado)=>{
     
            if(err){
                return res.status(500).json({
                    ok:false,
                    mensaje: 'Error al borrar el archivo',               
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
                archivo:archivoBorrado
            });
        });
});
module.exports = app;