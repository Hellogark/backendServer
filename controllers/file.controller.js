const uploadFolder = __dirname + '/uploads/';
const fs = require('fs');
 
exports.uploadFile = (req, res) => {
  res.send('File uploaded successfully! -> filename = ' + req.file.filename);
}

 
exports.downloadFile = (req, res) => {
  let filename = req.params.filename;
  res.download(uploadFolder + filename);  
}