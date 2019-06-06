var express = require('express');
var app = express();
var Proyecto = require('../models/proyectos');
var Tarea = require('../models/tareas');
var cors = require('cors');
var mwAutenticacion = require('../middlewares/autenticacion'); 
var moment = require('moment');	
const fecha = moment().locale('es').format("LLL");





//////////////////////////////
//Operaciones de tareas     //
/////////////////////////////

/**
 * 
 * @api {POST} tareas/:id/crear Crear Tarea
 * @apiName Crear Tarea
 * @apiGroup Tareas
 * @apiParam  {String} id id del proyecto
 * 
 * @apiSuccess (200) {json} TareaCreada Devuelve la tarea creada
 * @apiError (400) {json} ErrorCreandoTarea Error al momento de crear la tarea
 * @apiError (400) {json} ErrorVinculandoTarea Error al vincular la tarea con el proyecto
 */
////////////////////////
//Crear Tarea
///////////////////////
app.post('/:id/crear' ,[mwAutenticacion.verificaToken], (req,res) =>{
    var body = req.body;
    var idProyecto = req.params.id;
    var participanteId;
    body.participante.forEach(element => {
         participanteId=element._id;
    });
            console.log(body.nombreTarea);
            var generaTarea = new Tarea({
            nombre:body.nombre,
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

/**
 * 
 * @api {PUT} tareas/tareaTerminada Terminar tarea
 * @apiName Terminar tarea
 * @apiGroup Tareas
 * @apiParam  {String} idT id de la tarea
 * 
 * @apiSuccess (200) {json} TareaActualizada Devuelve la tarea actualizada
 * 
 */

    ////////////////////////
    //Actualizar checked
    ///////////////////////
    app.put('/tareaTerminada/:idT',mwAutenticacion.verificaToken,( req, res)=>{
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

    /**
     * 
     * @api {PUT} tareas/actualizar/:idTarea Actualizar la tarea
     * @apiName Actualizar tarea
     * @apiGroup Tareas    
     * @apiParam  {String} idTarea id de la tarea a actualizar
     * 
     * @apiSuccess (200) {json} TareaActualizada Regresa la tarea actualizada
     * @apiError (400) {json} TareaInexistente La tarea con el id no existe
     * @apiError (400) {json} ErrorAlActualizar Error al actualizar la tarea
     * @apiError (500) {json} ErrorBuscandoTarea Error al buscar la tarea en la base de datos
     */
    /////////////////////////////
    //Actualizar Tarea
    /////////////////////////////
    app.put('/actualizar/:idTarea' ,[mwAutenticacion.verificaToken],(req,res) =>{
        var body = req.body;
        var idProyecto =body.proyecto._id;
        var idTarea = req.params.idTarea;
        var idParticipante;
        body.participante.forEach(part => {
            idParticipante = part._id;         
        });       
      
 
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

/**
 * 
 * @api {GET} tareas/:id/mistareas Obtener tareas del usuario
 * @apiName Mis tareas
 * @apiGroup Tareas
 * @apiParam  {String} id id del usuario 
 * @apiSuccess (200) {json} Tareas Se envían las tareas a las cuales el usuario está asignado
 * @apiError (500) {json} ErrorObteniendoTareas Error mientras se obtenían las tareas
 * 
 * 
 */
    ////////////////////////
    //Obtener mis tareas
    /////////////////////////
    app.get('/:id/mistareas'  ,mwAutenticacion.verificaToken, (req,res) =>{

        var id = req.params.id;
        console.log(id)
        Tarea.find({participante:id})
            .populate('proyecto','nombre _id' )
            .populate('creador', 'nombre')
            .populate('participante', 'nombre')
            .sort({fechaCreacion: 1})
            .exec( (err,tareas) =>{
                    console.log(tareas)
                 if(err){
                     return res.status(500).json({
                         ok:false,
                         errors: {message: 'Error cargando tareas'}  ,
                         errpr:err
               
                 }); }

                 Tarea.countDocuments({}, (err,conteo) =>{
                     res.status(200).json({
                         ok:true,
                         total: conteo ,
                         tareas:tareas   
                     });
                });
          
         });
    });     

    /**
     * 
     * @api {GET} tareas/:id/tareas Obtene todas las tareas
     * @apiName Obtener todas las tareas
     * @apiGroup Tareas
     * @apiParam  {String} id id del proyecto
     * 
     * @apiSuccess (200) {json} tareas Devuelve las tareas encontradas del proyecto
     * @apiError (500) ErrorCargandoTareas Error al momento de obtener las tareas
     * 
     * 
     */
///////////////////////////////////////////
//Obtener Todas las tareas del proyecto
///////////////////////////////////////
app.get('/:id/tareas' ,
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
        (err,tareas) =>{
        if(err){
            return res.status(500).json({
                ok:false,
               errors: {message: 'Error cargando las tareas'}
        }); }
                        
            res.status(200).json({
                ok:true,          
                tareas   
            });    

        });
});

/////////////////////////////
//Editar Tarea
/////////////////////////////
app.get('/tareaEditar/:id' ,[mwAutenticacion.verificaToken],( req, res ) =>{
    var idTarea = req.params.id;

    Tarea.findById(idTarea)
    .populate('proyecto','nombre _id' )
    .populate('creador', 'nombre')
    .populate('participante', 'nombre _id')
    .exec( (err, tarea) =>{
        if(err){
            return res.status(401).json({
                ok:false,
                 errors: {message: 'Error al obtener la tarea, intente de nuevo por favor '}  
           })
        }
        res.status(201).json({
            ok:true,
            tarea:tarea
        })
    });
} );

/**
 * 
 * @api {DELETE} tareas/eliminarTarea/:idTarea Eliminar tarea
 * @apiName Eliminar Tarea
 * @apiGroup Tareas
 * @apiParam  {String} idTarea id de la tarea a eliminar
 * 
 * @apiSuccess (200) {json} TareaEliminada Devuelve la tarea eliminada 
 * @apiError (400) {json} TareaInexistente La tarea a eliminar no existe
 * @apiError (500) {json} ErrorEliminandoLaTarea Error al momento de eliminar la tarea
 */

/////////////////////////////
//Eliminar Tarea
/////////////////////////////

app.put('/eliminarTarea/:idTarea'  ,[mwAutenticacion.verificaToken], (req,res) =>{
    body = req.body;
    var idProyecto = body.idProyecto;
    var idTarea = req.params.idTarea;
    console.log(idTarea)
    console.log(body)
    Proyecto.findOneAndUpdate({_id:idProyecto}, {$pull: {tareas:idTarea}}, (err,tarea)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                errors: {message: 'Error al elimnar la tarea del proyecto '}  
              
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