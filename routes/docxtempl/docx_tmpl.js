const zlib = require('zlib');

var express = require('express');
var router = express.Router();

var JSZip = require('jszip');
var Docxtemplater = require('docxtemplater');

var fs = require('fs');
var path = require('path');

var jsonxml = require('jsontoxml');
var basicAuth = require('basic-auth');


var params = require('./docx_tmpl.json');


var auth = function (req, res, next) {
  var user = basicAuth(req);
  if (!user || !user.name || !user.pass) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    res.sendStatus(401);
    return;
  }
  if (user.name === 'osirik' && user.pass === 'passwd123') {
    next();
  } else {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    res.sendStatus(401);
    return;
  }
}
 
router.get("/auth", auth, function (req, res) {
    res.send("This page is authenticated!")
});

router.get('/', function(req, res, next) {
  res.send('ok');
});

router.get('/ls', function(req, res, next) {
// тестовый метод
// папка с шаблонами
var dir_content = path.resolve(__dirname, "./shablons/");

var walkSync = function(dir, dir2, filelist) {
    var path = path || require('path');
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
	dir2 = dir2 || "";
	
    files.forEach(function(file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = walkSync(path.join(dir, file), path.join(dir2, file), filelist);
        } else {
        
			filelist.push( { file: { path: dir2,  name: file }});
        }
    }); 
    return filelist;
};
  //res.send(walkSync ( path.join( dir_content, 'test')));
  
  res.send(jsonxml(JSON.stringify( {dir: path.join( dir_content, 'test'), files: walkSync ( path.join( dir_content, 'test')) } , null, 4)));
});
	
var currentDir = function(req) {

	var v_startpoint = req.body.startpoint; // от этого зависит стартовый каталог
	var v_folder = req.body.folder;
	var v_dir_content = ""; //path.resolve(__dirname, "./dummy/"); 

	for (var i = 0; i < params.foldermap.length; i++){
        if (params.foldermap[i].name == v_startpoint){
			v_dir_content =  params.foldermap[i].path; 
			return path.join( v_dir_content, v_folder );
		}
	}
	return path.resolve(__dirname, "./dummy/");
}
	
router.post('/index', function(req, res){

var v_file = currentDir(req) + "/index.json" ;
console.log(v_file);
var v_index = fs.readFileSync( v_file, 'utf8' );

var jsonContent = JSON.parse(v_index);
res.send( jsonxml( v_index) );
});

router.post('/document', function(req, res){
	
	req.pipe(fs.createWriteStream("dbg.txt"));
	//fs.createWriteStream("dbg.txt").pipe(req);
	genDoc(req, res);
	//res.send("OK");
});

function responseFile(filePath, fileName, response) {

  // Check if file specified by the filePath exists 
  fs.exists(filePath, function(exists){
      if (exists) {     
        // Content-type is very interesting part that guarantee that
        // Web browser will handle response in an appropriate manner.
        response.writeHead(200, {
          "Content-Type": "application/octet-stream",
          "Content-Disposition" : "attachment; filename=" + file});
        fs.createReadStream(filePath).pipe(response);
      } else {
        response.writeHead(400, {"Content-Type": "text/plain"});
        response.end("ERROR File does NOT Exists");
      }
    });
  }

router.post('/template', function(req, res){

	var v_shablon = req.body.shablon;
	var filePath = path.join( currentDir(req), v_shablon );	
	
	res.sendFile(filePath);	
});

function getFileForm(pFolder) {
	var frm = 
		'<form action="http://w341:3000/atlantis/v1/shablon/upload" method="post" enctype="multipart/form-data">' +
		'<input type="text" name="folder" value="'+ pFolder + '">' +
		'<input id="upload-input" type="file" name="uploads[]" multiple="multiple"></br>' + 
		'<input type="submit" value="Send">' +
		'</form>';
	return frm;
}
//----------------
function genDoc(req, res) {

var v_shablon = req.body.shablon;
var v_data = req.body.data;

var content_fl = path.join( currentDir(req), v_shablon );

console.log('Template = ' + content_fl);

var content = fs.readFileSync( content_fl, 'binary');

var zip = new JSZip(content);

var doc = new Docxtemplater();
doc.loadZip(zip);

//set the templateVariables
/*
doc.setData({
    first_name: 'John',
    last_name: 'Doe',
    phone: '0652455478',
    description: 'New Website'
});
*/
doc.setData( v_data );

try {
    // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
    doc.render()
}
catch (error) {
    var e = {
        message: error.message,
        name: error.name,
        stack: error.stack,
        properties: error.properties,
    }
    console.log(JSON.stringify({error: e}));
    // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
    throw error;
}

	var buf = doc.getZip().generate({type: 'nodebuffer'});
	
	res.writeHead(200, {
          "Content-Type": "application/octet-stream",
          "Content-Disposition" : 'attachment; filename="' + v_shablon + '"' });
    res.write(buf);
	res.end();
}

function fork (async_calls, shared_callback) {
  var counter = async_calls.length;
  var callback = function () {
    counter --;
    if (counter == 0) {
      shared_callback()
    }
  }

  for (var i=0;i<async_calls.length;i++) {
    async_calls[i](callback);
  }
}

router.get('/test', function(req, res, next) {
//fork([A,B,C],D);
  res.send('ok');
});






module.exports = router;
