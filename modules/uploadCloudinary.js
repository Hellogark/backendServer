const express = require('express');
var cloudinary = require('cloudinary').v2;
const app = express();
app.use(fileUpload({
    parseNested: true
}));

exports.subirCloud(id,nombreFile,archivo)