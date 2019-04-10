var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');	
const fecha = moment().format("dddd, MMMM Do YYYY, h:mm:ss a");

var tareasSchema = new Schema({
    nombre:{type: String, required:true,unique:true},
    descripcion: {type: String, required:true},
    fechaCreacion:{type: String, required:false,default: fecha},
    fechaFinalizado:{type: String, required:false},
    finalizado:{type: Boolean, default:false},
    creador: {type: Schema.Types.ObjectId,required:false,ref:'usuarios'},
    ultimoEditor:{type: Schema.Types.ObjectId,required:false,ref:'usuarios'},
    participantes:[{type: Schema.Types.ObjectId ,required:false,ref:'usuarios'}]

},{collection:'tareas'});
tareasSchema.index({'participantes':1});
module.exports = mongoose.model('tareas',tareasSchema);