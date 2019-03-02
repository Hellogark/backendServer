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

//Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

//conexion a la bd
mongoose.connect('mongodb://localhost:27017/DinamycsProyectos',{useNewUrlParser: true}, (err, res) => {
    if(err) throw err;
    console.log('Base de datos onlinen:\x1b[5m%s\x1b[0m',' online');


});
//Rutas
app.use('/usuario',usuarioRoutes);
app.use('/login',loginRoutes);
app.use('/',appRoutes);




//Escuchar peticiones

app.listen(3000, ()=>{
    console.log('Express server puerto 3000:\x1b[5m%s\x1b[0m',' online');
});
