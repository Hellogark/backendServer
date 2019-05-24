var express = require('express');
var app = express();
var mwAutenticacion = require('../middlewares/autenticacion'); 
var Proyecto = require('../models/proyectos');
var Usuario = require('../models/usuario');
//============================
//Busqueda Específica
//============================

/**
 * 
 * @api {GET} busqueda/info/:tabla/:busqueda Busqueda en usuarios o proyectos
 * @apiName Busqueda específica
 * @apiGroup Busqueda
 * @apiParam  {String} tabla Nombre de la colección en la que se busca
 * @apiParam {String} busqueda Término a buscar 
 * @apiSuccess (200) {json} ArregloDeDatos Devuelve un arreglo de usuarios o proyectos encontrados por la búsqueda
 * @apiError (400) {json} TiposIncorrectos Error cuando se buscan tablas que no existen 
 * 
 *  */
app.get('/info/:tabla/:busqueda',mwAutenticacion.verificaToken, (req,res) =>{

    var busqueda = req.params.busqueda;
    //La i de regex hace la expersión insensible a mayúsculas
    var regex = new RegExp(busqueda,'i');
    var tabla = req.params.tabla;
    var promesa;
    switch(tabla){
        case 'usuarios':
            promesa = buscarUsuarios(busqueda,regex);
            break;
        case 'proyectos':
            promesa = buscarProyectos(busqueda, regex);
            break;
        default: return res.status('400').json({
            ok:false,
            mensaje: 'Los tipos de búsqueda solo son: usuarios y proyectos',
            error: {message: 'Colección no válida'}
        
        });
    }
    promesa.then(data =>{
        return res.status('200').json({
            ok:true,
            //tabla está entre corchetes porque el nombre del objeto es el valor de la variable
            [tabla]:data
            
        });

    });
});

/**
 * 
 * @api {GET} busqueda/todo/:busqueda Esta ruta nos permite encontrar usuarios y proyectos
 * @apiName Busqueda general
 * @apiGroup Busqueda
 * @apiVersion  major.minor.patch
 * @apiParam  {String} busqueda El término que se recibe para buscar
 * @apiSuccess (200) {json} respuesta Devuelve un objeto que contiene el/los usuario(s) y/o proyecto(s) encontrado(s)
 * 
 * 
 */
//============================
//Busqueda General
//============================
app.get('/todo/:busqueda',mwAutenticacion.verificaToken,(req,res,next) =>{ 
    //params busqueda es lo del url /todo el param es /todo/param
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda,'i');
    if(busqueda == '' || busqueda == null){
        return false;
    }


    Promise.all( [
        buscarProyectos(busqueda,regex),
        buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {
             res.status('200').json({
                ok:true,
                proyectos: respuestas[0],
                usuarios: respuestas[1]
        
            });
        });
      

 
   
});
    /*
     * Esta función retorna los proyectos encontrados, los busca por nombre o por nombre de la empresa
     *
     */
    function buscarProyectos( busqueda, regex ){

        return new Promise((resolve, reject) =>{
            

             Proyecto.find({}, 'nombre nombreEmpresa fechaCreacion fechaProyectada participantes')
                .or([{'nombre': regex}])
                .or([{'nombreEmpresa':regex}])                
                .populate('responsable', 'nombre correo role fechaCreacion')
                .populate('ultimoEditor', 'nombre')
                .exec(      
              (err,proyectos) =>{
                if(err){
                    reject('Error al cargar proyectos', err);
                }else{

                    resolve(proyectos);
                }
                
        });
        });
    }

   
    /*
     * Esta función retorna los usuarios encontrados, los busca por nombre, correo y empresa     
     */
    function buscarUsuarios( busqueda, regex ){

        return new Promise((resolve, reject) =>{
            
            
             Usuario.find({},'nombre correo role empresa activo img ').populate('proyectos')
             .or([{'nombre': regex}])
             .or([{'correo':regex}])
             .or([{'empresa':regex}])
             .exec((err,usuarios)=>{
                    if(err){
                        reject('Error al cargar usuarios', err);
                    }else{
                         resolve(usuarios);
                    }
                });
        });
    }
       

    
module.exports = app;