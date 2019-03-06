    var express = require('express');
    var mdAuth = require('../middlewares/autenticacion');
    var fileUpload = require('express-fileupload');
    var fs = require('fs');
     
    var app = express();
     
    app.use(fileUpload('createParentPath', false));
     
    // Models
    var Hospital = require('../models/usuario');
    var Doctor = require('../models/proyectos');
    var User = require('../models/user');
     
    // Object with models
    var documents = { 'hospitals': Hospital, 'doctors': Doctor, 'users': User };
     
    /****************************************************************************************
     * Default file upload ssettings
     */
    var typeExt = ['jpg', 'jpeg', 'png', 'gif'];
    var typeDocuments = ['users', 'hospitals', 'doctors'];
     
    app.put('/:document/:id', mdAuth.verifyToken, (req, res, next) => {
     
        var document = req.params.document;
        var userID = req.params.id;
     
        if (typeDocuments.indexOf(document) < 0) {
            return res.status(400).json({
                ok: false,
                message: `Document ${document} does not exit in the data base collection`
            });
        }
     
        if (!req.files) {
            return res.status(400).json({
                ok: false,
                message: 'File does not selected'
            });
        }
     
        // Get the file extension
        var fileUpload = req.files.img;
        var fileExt = fileUpload.name.split('.').pop();
     
        // Validate the file extension
        if (typeExt.indexOf(fileExt.toLowerCase()) < 0) {
            return res.status(400).json({
                ok: false,
                message: 'File not valid',
                error: { message: `The valid file extension are ${typeExt.join(', ')}` }
            });
        }
     
        // Set new name to the file
        var newFileName = `${userID}-${new Date().getTime()}.${fileExt}`;
     
        // Save file in the new folder
        var userPath = `./public/uploads/${document}/${userID}`;
        var savePath = `./public/uploads/${document}/${userID}/${newFileName}`;
     
        // Create user folder if this doesn't exist
        if (!fs.existsSync(userPath)) fs.mkdirSync(userPath);
     
        // Load users files
        var uploadInfo = {
            userID: userID,
            document: document,
            userPath: userPath,
            newFileName: newFileName
        }
     
        setDateInDocuments(uploadInfo).then((data) => {
     
            fileUpload.mv(savePath, (err) => {
     
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: `ups!!! The file ${fileUpload.name} could not be uploaded`,
                        error: err
                    });
                }
     
                res.status(200).json({
                    ok: true,
                    message: 'Upload file was successfull',
                    ext: fileExt,
                    fileUpload: fileUpload.name,
                    newFileName: newFileName,
                    path: savePath,
                    document: document,
                    user: data
                })
     
            });
     
        }).catch((err) => {
            res.status(500).json({
                ok: false,
                message: `Error finding data in ${document} document`,
                errors: err
            })
        });
     
     
    });
     
    /*****************************************************************************************
     * @promese
     * Finding by id in the document to remove any existing files in the same route
     */
    function setDateInDocuments(uploadInfo) {
     
        var id = uploadInfo.userID;
        var document = uploadInfo.document;
        var userPath = uploadInfo.userPath;
        var newFileName = uploadInfo.newFileName;
     
        return new Promise((resolve, reject) => {
     
            documents[document].findById(id, (err, result) => {
     
                if (err) {
                    reject({
                        ok: false,
                        message: `User with id: ${id} does not exits`,
                        errors: err
                    });
                }
     
                // Validate if file exist in user folder
                var oldFilePath = `${userPath}/${result.img}`;
                if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
     
                // Set the new image to the user
                result.img = newFileName;
     
                // Save the new update
                result.save((err, updateResult) => {
     
                    if (err) {
                        reject({
                            ok: false,
                            message: `Error updating data from user id: ${id}`,
                            errors: err
                        });
                    }
     
                    // Hidden the password encrypted
                    updateResult.password = ':)';
     
                    // Send the user's updated data
                    resolve(updateResult);
     
                });
     
     
            })
        });
    }
     
    module.exports = app;