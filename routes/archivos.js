var express = require('express');
var app = express();
var Archivos = require('../models/archivos');
var mwAutenticacion = require('../middlewares/autenticacion'); 
//===================================
//obtener los archivos
//===================================
app.get('/',( req, res, next ) => {
    /*Campos a  devolver como segundo parámetro*/ 
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Archivos.find({} ).populate('usuarios', 'nombre correo')
    .populate('proyecto')
    .skip(desde).limit(3)
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


//===================================
// Crear los archivos POST
//===================================
app.post('/',mwAutenticacion.verificaToken,(req, res) =>{
    var body = req.body;
    console.log(body);
    var archivo = new Archivos({
        nombre: body.nombre,       
        fechaCreacion: body.fechaCreacion,
        fechaModificado: body.fechaModificado,
        responsable: req.Usuario._id,
        proyecto: body.proyecto /*EL. proyecto es el nombre del atributo proyecto de archivo module*/
        
    });

    archivo.save( (err, archivoGuardado) =>{
        if(err){
            return res.status(400).json({
                ok:false,
                mensaje: 'Error al crear archivo',
                errors: err                
        }); }

        res.status(201).json({
            ok:true,
            archivo: archivoGuardado
           
    });
    res.status(200).json({
        ok:true,
        body   
    });

    });
});

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