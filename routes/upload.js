var express = require('express');
const fileUpload = require('express-fileupload');
var fs = require('fs');
var md5 = require('md5');
const path = require('path');

var app = express();
app.use(fileUpload({
    parseNested: true
}));
var Usuario = require('../models/usuario');
var Proyecto = require('../models/proyectos');
var mwAutenticacion = require('../middlewares/autenticacion');
var Archivos = require('../models/archivos');


app.put('/:tipo/:id/', mwAutenticacion.verificaToken, (req, res) => {
    var tipo = req.params.tipo;
    var id = req.params.id;
    //Tipos de colecciones
    var tiposValidos = ['usuarios', 'proyectos'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({

            ok: false,
            mensaje: 'Tipo de colección no válida',
            errors: {
                message: 'La colección especificada no existe o está mal escrita'
            }
        });

    }
   
    //Obtener nombre del archivo
    var archivo;
    if (tipo === 'usuarios') {
        archivo = req.files.img;

    }

    if (tipo === 'proyectos') {
        if(req.files.archivos == undefined){
            return;
        }
        archivo = req.files.archivos;
    }
    var nombreArchivo = archivo.name.split('.');
    var ext = nombreArchivo[nombreArchivo.length - 1];
    //Extensiones aceptadas

    var extensionesUsuario = ['png', 'jpg', 'jpeg', 'gif'];
    var extensionesProyecto = ['rar', 'zip'];

    //buscar dentro del arreglo     

    if ((tipo === 'usuarios' && extensionesUsuario.indexOf(ext.toLowerCase()) < 0) ||
        (tipo === 'proyectos' && extensionesProyecto.indexOf(ext.toLowerCase()) < 0)) {
        return res.status(400).json({

            ok: false,
            mensaje: 'El archivo seleccionado no es válido',
            errors: {
                message: 'Archivo no válido'
            }

        });

    }

    //Nombre de archivo Personalizado
    var nombreFile = `${md5(nombreArchivo[0])}.${ext.toLowerCase()}`;

    //Mover el archivo del temporal a un path específico
    var pathArchivo = `./uploads/${ tipo }/${id}/${nombreFile}`;
    var pathCarpeta = `./uploads/${ tipo }/${id}/`;
    fs.readdir(pathCarpeta, function(err, files) {
        console.log('files')
        if (err) {
           console.log('Error al encontrar la carpeta')
        } else {
           if (files.length) {
               
            for (const file of files) {
                fs.unlink(path.join(pathCarpeta, file), err => {
                  if (err) throw err;
                });
              }
            
           } 
        }
    });
    if (!fs.existsSync(pathCarpeta)) {
        fs.mkdirSync(pathCarpeta)
    }
    

    archivo.mv(pathArchivo, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: err
            });

        }

        subirPorTipo(tipo, id, nombreFile, res, req);


    });





});

function subirPorTipo(tipo, id, nombreArchivo, res, req) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No se encontró un usuario con ese ID',
                    error: err
                });
            }


            var pathViejo = `./uploads/usuarios/${id}/${usuario.img}`;
            //Si existe archivo lo elimina
            if (fs.existsSync(pathViejo, (err) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Problemas al encontrar el archivo',
                            error: err
                        });
                    }

                })) {
                if (pathViejo != `./uploads/usuarios/${id}/${usuario.img}`) {
                    fs.unlinkSync(pathViejo);
                }
                
            }
            
            if (usuario.img != nombreArchivo) {
                
                usuario.img = nombreArchivo;
            }
            usuario.save((err, usuarioActualizado) => {
                
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'No se pudo acutalziar la imagen',
                        error: err
                    });
                } else {
                    usuario.password = ':v';
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada',
                        usuario: usuarioActualizado
                    });
                }
            });

        });
    }
    

}


    module.exports = app;