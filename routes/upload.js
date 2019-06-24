const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const md5 = require('md5');
const path = require('path');
var cloudinary = require('cloudinary').v2;
const app = express();
app.use(fileUpload({
    parseNested: true
}));
var Usuario = require('../models/usuario');
var mwAutenticacion = require('../middlewares/autenticacion');

////////////////////////////////////////////////
//Subir imagen de perfil
////////////////////////////////////////////////
/**,opciones, 
        (err, res) => {console.log(err, res); 
         }
 * 
 * @api {PUT} upload/:id Subir imagen de perfil
 * @apiName Subir imagen de perfil
 * @apiGroup Archivos
 * @apiParam {String} id id del usuario
 * @apiSuccess (200) {json} usuarioActualizad Devuelve el usuario actualizdo lo cual permite refrescar la imagen de perfil en la aplciación web
 * @apiError (400) {json} ArchivoInvalido El archivo seleccionado es inválido
 * @apiError (400) {json} UsuarioNoEncontrado El usuario con el id no pudo ser encontrado
 * @apiError (400) {json} ArchivoNoEncontrado Problemas al encontrar el archivo
 * @apiError (400) {json} NoSeAcualizóLaImagen La imagen de perfil no se puedo actualizar
 * @apiError (500) {json} ErrorLimpiandoCarpeta Error al momento de limpiar la carpeta del usuario
 * @apiError (500) {json} ErrorMoviendoArchivo Error al mover el archivo a la carpeta designada
 * 
 */
app.put('/:id', mwAutenticacion.verificaToken,async (req, res) => {    
    var id = req.params.id;  
   console.log(req.files.path+'a');
    //Obtener nombre del archivo
    var archivo = req.files.img;   
    console.log(archivo.data)
 
   
    var nombreArchivo = archivo.name.split('.');
    var ext = nombreArchivo[nombreArchivo.length - 1];
    //Extensiones aceptadas
    var extensionesUsuario = ['png', 'jpg', 'jpeg', 'gif'];   
    
    //buscar dentro del arreglo     
    
    if (extensionesUsuario.indexOf(ext.toLowerCase()) < 0) {
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
    archivo.name = nombreFile;
    var opciones ={        
        public_id: archivo.name,
        use_filename:true,
        unique_filename:false,
        folder: `usuarios/${id}/`,
        use_filename:true
    };

   const result = await cloudinary.uploader.upload_stream(opciones, res=>console.log(res)).end(archivo.data);
   console.log(result)
    //Mover el archivo del temporal a un path específico
    var pathArchivo = `./uploads/usuarios/${id}/${nombreFile}`;
    var pathCarpeta = `./uploads/usuarios/${id}/`;
    //Busca si en la carpeta del usuario tiene archivos y los elimina
    //para después añadir la nueva imagen de perfil
    fs.readdir(pathCarpeta, function(err, files) {       
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error limpiando la carpeta del usuario',
                errors: err
            });
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

        subirImgPerfil( id, nombreFile, res, req);


    });





});

/**
 * Función que nos permite  reemplazar el arcchivo en caso de que exista 
 */
function subirImgPerfil(id, nombreArchivo, res, req) {   
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




    module.exports = app;