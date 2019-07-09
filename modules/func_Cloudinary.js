const express = require('express');
var cloudinary = require('cloudinary').v2;
const app = express();
const fileUpload = require('express-fileupload');
app.use(fileUpload({
    parseNested: true
}));

exports.subirCloud = async (id,nombreFile,archivo,tipo,formato,res) =>{
    var opciones ={        
        public_id: nombreFile,
        use_filename:true,
        unique_filename:false,
        folder: `${tipo}/${id}/`,       
        resource_type: "auto",
        async:true,
        format:formato
    };     
        try {
            
        const result = await cloudinary.uploader.upload_stream(opciones, res=>console.log(res)).end(archivo.data);
        return result;
    
    } catch (error) {
        return res.status(400).json({
            ok:false,
            errors:{
                message: 'Hubo un problema al subir la imagen al servidor'
            }
        })
    }     
}
   