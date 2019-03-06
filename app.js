// Requires importación de librerias
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//inicializar variables, aquí se usa la librería
var app = express();
//Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
//Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var proyectosRoutes = require('./routes/proyectos');
var archivosRoutes = require('./routes/archivos');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var obtenerArchivosRoutes = require('./routes/obtenerArchivos');

//conexion a la bd
mongoose.connect('mongodb://localhost:27017/DinamycsProyectos',{useNewUrlParser: true}, (err, res) => {
    if(err) throw err;
    console.log('Base de datos onlinen:\x1b[5m%s\x1b[0m',' online');


});

//Server index config
/* var serveIndex= require('serve-index');
app.use(express.static(__dirname+'/'));
app.use('/uploads',serveIndex(__dirname+'/uploads')); */

//Rutas
app.use('/usuario',usuarioRoutes);
app.use('/proyectos',proyectosRoutes);
app.use('/archivos',archivosRoutes);
app.use('/login',loginRoutes);
app.use('/busqueda',busquedaRoutes);
app.use('/upload',uploadRoutes);
app.use('/img',obtenerArchivosRoutes);
app.use('/',appRoutes);




//Escuchar peticiones

app.listen(3000, ()=>{
    console.log('Express server puerto 3000:\x1b[5m%s\x1b[0m',' online');
});
