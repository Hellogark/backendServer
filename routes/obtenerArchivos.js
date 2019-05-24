var express = require('express');
var app = express();
const path = require('path');
const fs = require('fs');

//rutas
app.get('/:tipo/:id/:img',( req, res, next ) => {

    var tipo = req.params.tipo;
    var img = req.params.img;
    var id = req.params.id;
    var pathArchivo = path.resolve(__dirname,`../uploads/${tipo}/${id}/${img}`);

    switch (tipo) {
        case 'usuarios':
        if(fs.existsSync(pathArchivo)){
            res.sendFile(pathArchivo);       
        }else{
            var pathNoImage = path.resolve(__dirname,'../assets/no-img.png');
            res.sendFile(pathNoImage);
        }
            break;
        case 'proyectos':
        if(fs.existsSync(pathArchivo)){
            res.download(pathArchivo);       
        }

        break;    
    }
    
   

});

module.exports = app;