// Requires importación de librerias
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
var dotenv = require('dotenv');
dotenv.config();

//inicializar variables, aquí se usa la librería
var app = express();
app.use(function(req, res, next) {
     
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    
    next();
});

app.use(helmet());
app.use(cors());
//Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var proyectosRoutes = require('./routes/proyectos');
var archivosRoutes = require('./routes/archivos');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var tareasRoutes= require('./routes/tareas');

//Conexión realizada a atlas
//mongodb+srv://eduardoAtDinamycs:3v98ZOf7Xijl8bS1@clusterproyectos-da6ml.mongodb.net/DinamycsProyectos?retryWrites=true
try {
    mongoose.connect(process.env.MONGODB_URL,{useNewUrlParser: true}, (err, res) => {
        if(err) throw err;
        console.log('Base de datos online:\x1b[5m%s\x1b[0m',' online');
    });
    
} catch (error) {
    console.log('Error en la conexión a la base de datos:\x1b[5m%s\x1b[0m',' online');
}



//Rutas
app.use('/usuario',usuarioRoutes);
app.use('/proyectos',proyectosRoutes);
app.use('/archivos',archivosRoutes);
app.use('/login',loginRoutes);
app.use('/busqueda',busquedaRoutes);
app.use('/upload',uploadRoutes);
app.use('/tareas',tareasRoutes);
app.use('/',appRoutes);




//Escuchar peticiones

app.listen(process.env.PORT || 3000, ()=>{
    console.log('Express server puerto 3000:\x1b[5m%s\x1b[0m',' online');
});
