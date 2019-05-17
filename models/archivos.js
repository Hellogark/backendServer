var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const fecha = new Date().toLocaleDateString('es-ES');



var archivosSchema = new Schema({   
        nombre: {type:String, required:true, unique:true},
        fechaCreacion: {type:String, required:true,default:fecha},
        comentario: {type: String, required: true},
        responsable: {type: Schema.Types.ObjectId,required:true, ref:'usuarios'},     
},{collection:'archivos'});
archivosSchema.index({'nombre': 1});
module.exports = mongoose.model('archivos',archivosSchema);