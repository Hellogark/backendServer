var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');	
const fecha = moment().locale('es').format("LLL");
/**
 * Esquema de Mongoose para Proyectos 
 */
var proyectosSchema = new Schema({
    nombre:{type: String, required:true,unique:true},
    descripcion: {type: String, required:true},
    fechaCreacion:{type: String, required:false,default: fecha},
    fechaProyectada:{type: String, required:false},
    nombreEmpresa:{type: String, required:true},
    responsable: {type: Schema.Types.ObjectId,required:false,ref:'usuarios'},
    ultimoEditor:{type: Schema.Types.ObjectId,required:false,ref:'usuarios'},
    participantes:[{type: Schema.Types.ObjectId ,required:false,ref:'usuarios'}],
    archivos: [{type: Schema.Types.ObjectId,required:false, ref:'archivos'}],
    tareas: [{type: Schema.Types.ObjectId, required: false, ref: 'tareas'}]

},{collection:'proyectos'});
/**
*Ínidces para realizar una búsqueda más rápida entre las colecciones
*/
proyectosSchema.index({'participantes':1});
proyectosSchema.index({'archivos':1});
proyectosSchema.index({'tareas':1});
module.exports = mongoose.model('proyectos',proyectosSchema);