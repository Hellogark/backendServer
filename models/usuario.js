var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');
var moment = require('moment');
	
const fecha = moment().locale('es').format("LLL");
/** Roles permitidos */
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
	empresa:{type: String, required:false}	
	

},{collection:'usuarios'});
/**Collection: Nombre de la colección en la base de datos,
 en caso de no existir colección se creará con ese nombre */
usuarioSchema.plugin( uniqueValidator, {message: 'El {PATH} ya se encuentra registrado'} )
/**mongoose asume por defecto que el nombre de la colección será el plural y minúsucla del nombre del modelo
*Hay que crear las coleciones en la base de datos en minúscula y plural
*/
module.exports = mongoose.model('usuarios', usuarioSchema);