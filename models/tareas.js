var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');	
const fecha = moment().locale('es').format("LLL");

var tareasSchema = new Schema({
    nombre:{type: String, required:false,default:'',unique:true,sparse:true},
    descripcion: {type: String, required:false,default:'',sparse:true},
    fechaCreacion:{type: String, required:false,default: fecha,sparse:true},
    fechaFinalizado:{type: String, required:false,sparse:true},
    fechaLimite: {type: String, required:false},
    finalizado:{type: Boolean, default:false,sparse:true}, 
    creador: {type: Schema.Types.ObjectId,required:false,ref:'usuarios',sparse:true},
    ultimoEditor:{type: Schema.Types.ObjectId,required:false,ref:'usuarios',sparse:true},
    participante:{type: Schema.Types.ObjectId ,required:false,ref:'usuarios'},
    proyecto: {type: Schema.Types.ObjectId, required:true, ref:'proyectos',sparse:true}

},{collection:'tareas'});
tareasSchema.index({'participante':1});
module.exports = mongoose.model('tareas',tareasSchema);