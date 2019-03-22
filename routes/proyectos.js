var express = require('express');
var app = express();
var Proyecto = require('../models/proyectos');
var Archivos = require('../models/archivos');
var cors = require('cors');
var mwAutenticacion = require('../middlewares/autenticacion'); 
//===================================
//obtener todos los proyectos ADMIN
//===================================
app.get('/',cors({origin:"http://localhost:4200"}),mwAutenticacion.verificaRol,( req, res, next ) => {
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
app.get('/id/:id',cors({origin:"http://localhost:4200"}),async ( req, res, next ) => {
    /*Campos a  devolver como segundo parámetro*/ 
    var id = req.params.id;
    var desde = req.query.desde || 0;
    desde = Number(desde);
   await Proyecto.findById(id)
    .populate('archivos','nombre,_id')
    .populate('participantes','nombre empresa')    
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
        
        Proyecto.count({}, (err,conteo) =>{

        
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

//===================================
//Actualizar los proyectos
//===================================
//:id especifica un segmento en la ruta /proyecto/id
app.put('/editarProyecto/:id',cors({origin:"http://localhost:4200"}),[mwAutenticacion.verificaToken,mwAutenticacion.verificaRol],(req,res) =>{
    var id = req.params.id;
    var body = req.body;
    var arregloPart = [];
    
    body.participantes.forEach(element => {
                arregloPart.push(element._id);
        });
       // arregloPart=body.participantes;

        return res.status(200).json({
            ok:true,
            mensaje: 'Error al buscar proyecto',               
            errors: arregloPart               
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
        proyecto.responsable = req.Usuario._id;
        proyecto.ultimoEditor = req.Usuario._id;
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


//===================================
// Crear los proyectos POST
//===================================
app.post('/:id',cors({origin:"http://localhost:4200"}),[mwAutenticacion.verificaToken,mwAutenticacion.verificaRol],(req, res) =>{
    var body = req.body;
    var proyecto = new Proyecto({
        nombre: body.nombre,
        descripcion: body.descripcion,
        fechaCreacion: body.fechaCreacion,
        fechaProyectada: body.fechaProyectada,
        nombreEmpresa: body.nombreEmpresa,
        responsable: req.Usuario._id,
        ultimoEditor: req.Usuario._id,
        participantes: body.participantes,
        archivos: body.archivos
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


app.delete('/:id',cors({origin:"http://localhost:4200"}),[mwAutenticacion.verificaToken,mwAutenticacion.verificaRol],(req,res)=>{
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
module.exports = app;