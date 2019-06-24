var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');
const fecha  = moment().locale('es').format("LLL");


/**
 * Esquema de Mongoose para archivos 
 */
var archivosSchema = new Schema({   
        nombre: {type:String, required:true, unique:true},
        fechaCreacion: {type:String, required:true,default:fecha},
        imageURL: {type: String, required:true},
        fechaModificacion: {type:String, required:false},
        comentario: {type: String, required: true},
        responsable: {type: Schema.Types.ObjectId,required:true, ref:'usuarios'},
},{collection:'archivos'});
/**ínidce para encontrar más rápido un documento mediante  nombre */
archivosSchema.index({'nombre': 1});
module.exports = mongoose.model('archivos',archivosSchema);