var express = require('express');
var app = express();
var Proyecto = require('../models/proyectos');
var Usuario = require('../models/usuario');
var Tarea = require('../models/tareas');
var cors = require('cors');
var mwAutenticacion = require('../middlewares/autenticacion'); 
var moment = require('moment');	
const fecha = moment().locale('es').format("LLL");





//////////////////////////////
//Operaciones de tareas     //
/////////////////////////////


////////////////////////
//Crear Tarea
///////////////////////
app.post('/:id/crear',cors({origin:"http://localhost:4200"}),[mwAutenticacion.verificaToken], (req,res) =>{
    var body = req.body;
    var idProyecto = req.params.id;
    var participanteId;
    body.participante.forEach(element => {
         participanteId=element._id;
    });
 
            var generaTarea = new Tarea({
            nombre:body.nombreTarea,
            descripcion: body.descTarea,
            fechaCreacion: fecha,
            fechaLimite: body.fechaLimite,
            creador: body.creador,
            ultimoEditor: body.ultimoEditor,
            participante: participanteId,
            proyecto: idProyecto
            });
           generaTarea.save( (err,tareaCreada) =>{

            if(err){
                return res.status(400).json({
                    ok:false,
                    mensaje: 'Error al crear el o las tareas',
                    errors: err                
            }); }
             Proyecto.findOneAndUpdate({_id:idProyecto},{$push:{tareas:tareaCreada._id}},{new:true}, (err,resp)=>{

             if(err){
                return res.status(400).json({
                    ok:false,
                    mensaje: 'Error al vincular la tarea con el proyecto',
                    errors: err                
            }); }
            return res.status(201).json({
                ok:true,
                tareas: tareaCreada,            
            });      

             });        
    });
});



    ////////////////////////
    //Actualizar checked
    ///////////////////////
    app.put('/tareaTerminada/:idT', cors({origin: "http://localhost:4200"}),mwAutenticacion.verificaToken,( req, res)=>{
        var body = req.body;
        //console.log(body);
        var idTarea = req.params.idT;
        Tarea.findOneAndUpdate({_id: idTarea},{$set: {finalizado:body.finalizado, fechaFinalizado:body.fechaFinalizado, ultimoEditor:body.ultimoEditor}},{new:true}, (err, respTarea) =>{
            console.log(respTarea)
            return  res.status(200).json({
                ok:true,
                tarea:respTarea   
            });
        });

    });

    /////////////////////////////
    //Actualizar Tarea
    /////////////////////////////
    app.put('/:idProyecto/actualizar/:idTarea',cors({origin:"http://localhost:4200"}),[mwAutenticacion.verificaToken],(req,res) =>{
        var body = req.body;
        var idProyecto = req.params.idProyecto;
        var idTarea = req.params.idTarea;
        var idParticipante;
        body.participante.forEach(part => {
            idParticipante = part._id;
            console.log(part);
        });
        console.log(idParticipante);
 
        Tarea.findById(idTarea, (err,tarea)=>{
    
            if(err){
                return res.status(500).json({
                    ok:false,
                    mensaje: 'Error al buscar la tarea a editar',               
                    errors: err                
            }); }
            if(!tarea){
                return res.status(400).json({
                    ok:false,
                    mensaje: 'La tarea con el id '+idTarea+' no existe',               
                    errors: {message: 'No existe una tarea con este ID '}  
    
                    }
                );
            }
            tarea.nombre = body.nombre;
            tarea.fechaLimite = body.fechaLimite;
            tarea.descripcion = body. descTarea;
            tarea.ultimoEditor = body.ultimoEditor;
            tarea.participante = idParticipante;
            tarea.proyecto = idProyecto;
            tarea.save( (err,tareaGuardada) =>{
                if(err){
                    return res.status(400).json({
                        ok:false,
                        mensaje: 'Error al actualizar la tarea',               
                        errors: err                
                }); }
                res.status(200).json({
                    ok:true,                  
                    tareaG: tareaGuardada  
                });
                
                
            })
        });
    
    
    
    
    });


    ////////////////////////
    //Obtener mis tareas
    /////////////////////////
    app.get('/mistareas/:id', cors({origin:"http://localhost:4200"}),mwAutenticacion.verificaToken, (req,res) =>{

        var id = req.params.id;
        Tarea.find({participantes:id})
            .populate('proyecto','nombre _id' )
            .populate('creador', 'nombre')
            .populate('participante', 'nombre')
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
    .populate('tareas') 
    .populate({path: 'tareas' ,populate: {path:'participante'}})
    .populate({path: 'tareas', populate: {path: 'creador'}})    
    .exec(
        (err,proyectos) =>{
        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error cargando proyectos',
                errors: err                
        }); }
                        
            res.status(200).json({
                ok:true,          
                proyectos   
            });    

        });
});

/////////////////////////////
//Obtener Una Tarea
/////////////////////////////
app.get('/tareaEditar/:id',cors({origin:"http://localhost:4200"}),[mwAutenticacion.verificaToken],( req, res ) =>{
    var idTarea = req.params.id;

    Tarea.findById(idTarea)
    .populate('proyecto','nombre _id' )
    .populate('creador', 'nombre')
    .populate('participante', 'nombre _id')
    .exec( (err, tarea) =>{
        res.status(201).json({
            ok:true,
            tarea:tarea
        })
    });
} );



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
                tareaBorrada: tareaBorrada
            });
        });
    });
});
module.exports = app;