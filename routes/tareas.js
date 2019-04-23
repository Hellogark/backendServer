var express = require('express');
var app = express();
var Proyecto = require('../models/proyectos');
var Usuario = require('../models/usuario');
var Tarea = require('../models/tareas');
var cors = require('cors');
var mwAutenticacion = require('../middlewares/autenticacion'); 






//////////////////////////////
//Operaciones de tareas     //
/////////////////////////////


////////////////////////
//Crear Tarea
///////////////////////
app.post('/id:/crear',cors({origin:"http://localhost:4200"}),[mwAutenticacion.verificaToken], (req,res) =>{
    var body = req.body;
    var idProyecto = req.params.id;
  
            var generaTarea = new Tarea({
              proyecto: idProyecto
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

    ////////////////////////
    //Actualizar Tarea
    ///////////////////////
    app.put('/:idP/actualizar/:idT', cors({origin: "http://localhost:4200"}),mwAutenticacion.verificaToken,( req, res)=>{
        var idProyecto = req.params.idP;
        var idTarea = req.params.idT;
        var body = req.body;
        Tarea.findOneAndUpdate({_id:idTarea})

    });

    ////////////////////////
    //Obtener mis tareas
    /////////////////////////
    app.get('/mistareas/:id', cors({origin:"http://localhost:4200"}),mwAutenticacion.verificaToken, (req,res) =>{

        var id = req.params.id;
        Tarea.find({participantes:id})
            .populate('proyecto','nombre _id' )
            .populate('creador', 'nombre')
            .sort({fechaCreacion: 1})
            .exec( (err,tareas) =>{

                 if(err){
                     return res.status(500).json({
                         ok:false,
                         mensaje: 'Error cargando tareas',
                         errors: err                
                 }); }

                 Tarea.countDocuments({}, (err,conteo) =>{
                     res.status(200).json({
                         ok:true,
                         total: conteo ,
                         tareas   
                     });
                });
          
         });
    });     

////////////////////////////////////////
//Obtener Todas las tareas del proyecto
///////////////////////////////////////
app.get('/:id/tareas',cors({origin:"http://localhost:4200"}),
[mwAutenticacion.verificaToken],
( req, res, next ) => {
    /*Campos a  devolver como segundo parámetro*/ 
    var idProyecto = req.params.id;
  
    Proyecto.find({_id:idProyecto})
    .select('tareas')      
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
/////////////////////////////
//Editar Tarea
/////////////////////////////
app.put('/:idProyecto/tareas/:idTarea',cors({origin:"http://localhost:4200"}),[mwAutenticacion.verificaToken],(req,res) =>{
    var body = req.body;
    var idProyecto = req.params.idProyecto;
    var idTarea = req.params.idTarea;




});



/////////////////////////////
//Eliminar Tarea
/////////////////////////////

app.delete('/:idProyecto/eliminarTarea/:idTarea', cors({origin:"http://localhost:4200"}),[mwAutenticacion.verificaToken], (req,res) =>{
    var idProyecto = req.params.idProyecto;
    var idTarea = req.params.idTarea;
    Proyecto.findOneAndUpdate({_id:idProyecto}, {$pull: {tareas:idTarea}}, (err,tarea)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al borrar la tarea',               
                errors: err                
        }); }
       
        if(!tarea){
            return res.status(400).json({
                ok:false,
                mensaje: 'No existe un tarea con ese id en el proyecto',               
                errors: {message: 'No existe un tarea con ese id'}                
        }); }
        Tarea.findByIdAndRemove(idTarea,(err, tareaBorrada)=>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    mensaje: 'Error al borrar tarea',               
                    errors: err                
            }); }
           
            if(!tareaBorrada){
                return res.status(400).json({
                    ok:false,
                    mensaje: 'No existe un tarea con ese id',               
                    errors: {message: 'No existe un tarea con ese id'}                
            }); }
            res.status(200).json({
                ok: true,
                proyecto: tareaBorrada
            });
        });
    });
});
module.exports = app;