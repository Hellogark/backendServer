var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');	
const fecha = moment().format("dddd, MMMM Do YYYY, h:mm:ss a");


var archivosSchema = new Schema({
    nombre: {type:String, required:true},
    fechaCreacion: {type:String, required:true,default:fecha},
    fechaModificado: {type:String, required:false, default: fecha},
    responsable: {type: Schema.Types.ObjectId,required:true, ref:'usuarios'},
    proyecto: {type: Schema.Types.ObjectId,required:false, ref:'proyectos'}
},{collection:'archivos'});
module.exports = mongoose.model('archivos',archivosSchema);