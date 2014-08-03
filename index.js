// web.js
var express = require("express");
var logfmt = require("logfmt");
var fs = require('fs');
var path = require('path');
var app = express();

app.use(logfmt.requestLogger());

//dynamically register all submoduls
var htmlFolderList = ''
    analyticsCode = '';


fs.readFile(path.join(process.cwd(),'inc','analytics.txt'),function(err, data){
    if (err) throw err;
	analyticsCode = data;
  });

//TODO: inject funny stuff
app.use(function(req, res, next) {
  console.log('type',req.url);
  //res.body = replace(res.body,'<!---->','');
  next();
});

app.get('/', function(req, res) {
  //res.setHeader("Content-Type", "text/html");
  res.type('html');
  fs.readFile(path.join(process.cwd(),'index.html'),function(err, data){
    if (err) throw err;
	data = data.toString().replace('<!--apps-->', htmlFolderList);
	res.send(data);
  });
});

//static
app.use('/static', express.static(path.join(process.cwd(),'static')));

app.use('/robots.txt', express.static(path.join(process.cwd(),'robots.txt')));


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


fs.readdir(path.join(process.cwd(),'node_modules'), function (err, files) { // '/' denotes the root folder
  var action; //stores what to do with the folder
  if (err) throw err;

   files.forEach( function (file) {
     fs.lstat(path.join(process.cwd(),'node_modules', file), function(err, stats) {
	   action = parseFolderName(file);
	 
       if (!err && stats.isDirectory() && action.valid) { //conditing for identifying folders
         htmlFolderList += '<li><a href="/'+action.name+'">'+action.name+'</a></li>';
		 
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
