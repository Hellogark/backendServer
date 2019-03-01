// Requires importación de librerias
var express = require('express');
var mongoose = require('mongoose');



//conexion a la bd
mongoose.connect('mongodb://localhost:27017/DinamycsProyectos',{useNewUrlParser: true}, (err, res) => {
    if(err) throw err;
    console.log('Base de datos onlinen:\x1b[5m%s\x1b[0m',' online');


});

//inicializar variables, aquí se usa la librería
var app = express();

//rutas
app.get('/',( req, res, next ) => {
    res.status(200).json({
        ok:true,
        mensaje: 'Petición realizada correctamente'

    })

})

//Escuchar peticiones

app.listen(3000, ()=>{
    console.log('Express server puerto 3000:\x1b[5m%s\x1b[0m',' online');
});
