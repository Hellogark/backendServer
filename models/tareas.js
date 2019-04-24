var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');	
const fecha = moment().locale('es').format("LLL");

var tareasSchema = new Schema({
    nombre:{type: String, required:false,unique:true,default:''},
    descripcion: {type: String, required:false,default:''},
    fechaCreacion:{type: String, required:false,default: fecha},
    fechaFinalizado:{type: String, required:false},
    finalizado:{type: Boolean, default:false},
    creador: {type: Schema.Types.ObjectId,required:false,ref:'usuarios'},
    ultimoEditor:{type: Schema.Types.ObjectId,required:false,ref:'usuarios'},
    participante:{type: Schema.Types.ObjectId ,required:false,ref:'usuarios'},
    proyecto: {type: Schema.Types.ObjectId, required:true, ref:'proyectos'}

},{collection:'tareas'});
tareasSchema.index({'participante':1});
module.exports = mongoose.model('tareas',tareasSchema);