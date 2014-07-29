// web.js
var express = require("express");
var logfmt = require("logfmt");
var fs = require('fs');
var path = require('path');
var app = express();

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  res.send('Hello World!');
});


var parseFolderName = function(folderName){
  var r = {
	valid:false,	
	name:'',
	type:''
  };
  var nameParts = folderName.split('_');
  if ((nameParts[0] === 'folder' || nameParts[0] === 'subdomain') &&
      nameParts.length === 2){
	r.valid = true;
	r.type = nameParts[0];
	r.name = nameParts[1];
  }
  return r;
};

//dynamically register all submoduls
var htmlFolderList = '';
fs.readdir(path.join(process.cwd(),'node_modules'), function (err, files) { // '/' denotes the root folder
  var action; //stores what to do with the folder
  if (err) throw err;

   files.forEach( function (file) {
     fs.lstat(path.join(process.cwd(),'node_modules', file), function(err, stats) {
	   action = parseFolderName(file);
	 
       if (!err && stats.isDirectory() && action.valid) { //conditing for identifying folders
         htmlFolderList += '<li class="folder"><a href="/'+action.name+'">'+action.name+'</a></li>';
		 
		 //register folder in app
		 if (action.type === 'folder'){
			app.use('/'+action.name, express.static(path.join(process.cwd(),'node_modules', file)));
		 }
       }
     });
   });
});


app.get('/list', function(req, res) {
  res.send(htmlFolderList);
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
