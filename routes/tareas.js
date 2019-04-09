var express = require('express');
var app = express();
const fileUpload = require('express-fileupload');
app.use(fileUpload({
    parseNested: true
}));
var fs = require('fs');
var md5 = require('md5');

var Proyecto = require('../models/proyectos');
var Usuario = require('../models/usuario');
var Archivo = require('../models/archivos');
var cors = require('cors');
const path = require('path');
var mwAutenticacion = require('../middlewares/autenticacion'); 