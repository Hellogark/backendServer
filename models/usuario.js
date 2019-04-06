var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');
var moment = require('moment');
	
const fecha = moment().format("dddd, MMMM Do YYYY, h:mm:ss a");// datejs.Date.i18n.setLanguage(['es-MX']);
var rolesUnicos = {
	values: ['ADMIN_ROLE','USER_ROLE'],
	message: '{VALUE} no es un rol permitido'
};
var usuarioSchema = new Schema({
    nombre: {type: String, required: [true, "El nombre es necesario"] } ,
    correo: {type: String, unique:true, required: [true, "El correo es necesario"],lowercase:true } ,
	password: {type: String,  required: [true, "La contraseña es necesaria"] } ,
	fechaCreacion:{type: String, required:true,default: fecha},		
	img: {type: String, required: false, default:'' } ,		
	role: {type: String, required: false, default:'USER_ROLE',uppercase:true, enum: rolesUnicos} ,
	activo:{type:Boolean,required:true,default:false},
	empresa:{type: String, required:false},	

},{collection:'usuarios'});

usuarioSchema.plugin( uniqueValidator, {message: 'El {PATH} ya se encuentra registrado'} )
//Exportar modelo La primer letra en mayúscula del nombre del modelo, en la bd debe de estar en minúscula
module.exports = mongoose.model('usuarios', usuarioSchema);