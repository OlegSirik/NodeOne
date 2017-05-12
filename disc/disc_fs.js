var express = require('express');
var router = express.Router();
var fs = require("fs");
var exec = require("child_process").exec;
var shortId = require("shortid");

var formidable = require('formidable');
var path = require('path');
var shortid = require('shortid');

function upload_fl(req, res, theEnd){

	var catalogData = {};
	//var uid = shortid.generate();
	//console.log(uid);
	//var uploadDir = path.join(__dirname, '../../uploads/p'+uid);
	
	catalogData.folder = shortid.generate();
	//catalogData.uploadDir =  path.join(__dirname, '../../uploads/' + catalogData.folder);
	//catalogData.uploadDir =  path.join('S:\\ESB_FILES\\Prod\\files\\catalog\\' + catalogData.folder);
	catalogData.uploadDir =  path.join('//mnt/esb_files/Prod/files/catalog/' + catalogData.folder);
	//catalogData.catalogDir =  path.join('S:\\ESB_FILES\\Prod\\files\\catalog\\' + catalogData.folder);
	catalogData.catalogDir =  path.join('//mnt/esb_files/Prod/files/catalog/' + catalogData.folder);
	catalogData.files = [];

	catalogData.communicationName = 'WSCataloged';
	catalogData.documentTypeId = 0;
	catalogData.policyId = 0;
	catalogData.claimId = 0;
	catalogData.contactId = 0;

	fs.mkdir(catalogData.uploadDir,function(err){
	if (err) {
      return console.error(err);
	}
		console.log("Directory created successfully!");
	});
	
	// create an incoming form object
  var form = new formidable.IncomingForm();
  
  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = catalogData.uploadDir; //path.join(__dirname, '../../uploads');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', 
	function(field, file) {
		catalogData.files.push( file.name);
console.log("ON FILE1:"+file.name);    
		fs.rename(file.path, path.join(catalogData.uploadDir, file.name),function(err){
			if (err) {	return console.error(err);	}
		});

		});

  form.on('field', function(name, value) {
		
		switch ( name ) {
			case "commName": 
				catalogData.communicationName = value;
				break;
			case "docTypeId": 
				catalogData.documentTypeId = value;
				break;
			case "policyId": 
				catalogData.policyId = value;
				break;
			case "claimId": 
				catalogData.claimId = value;
				break;
			case "contactId": 
				catalogData.contactId = value;
				break;
			case "systemModule":
				catalogData.systemModule = value;
				break;
			default:
				break;
		}
    });
	
  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
  
console.log("ON END:" + catalogData.communicationName);
console.log("ON END:" + catalogData.systemModule);
console.log("ON END:" + catalogData.documentTypeId);
console.log("ON END:" + catalogData.policyId);
console.log("ON END:" + catalogData.contactId);
console.log("ON END:" + catalogData.claimId);

		if (catalogData.systemModule==undefined) catalogData.systemModule = 'POLICY';
	var dt = 
	'<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:com="http://www.in-touch.ru/services/communication"><soap:Header/> ' +
	"<soap:Body><com:catalog>" + 
	"<com:communication>" +
	"<com:name>"+ catalogData.communicationName +"</com:name>" + 
	"<com:systemModule>" +  catalogData.systemModule + "</com:systemModule>" +
	"<com:documentTypeId>"+ catalogData.documentTypeId +"</com:documentTypeId><com:refferalData>";

	if (catalogData.policyId != 0) dt = dt + "<com:entity><com:type>POLICY</com:type><com:id>" + catalogData.policyId + "</com:id></com:entity>";
	if (catalogData.contactId != 0) dt = dt + "<com:entity><com:type>CONTACT</com:type><com:id>" + catalogData.contactId + "</com:id></com:entity>";
	if (catalogData.claimId != 0) dt = dt + "<com:entity><com:type>CLAIM</com:type><com:id>" + catalogData.claimId + "</com:id></com:entity>";

	dt = dt + "</com:refferalData><com:files>";
	
	
	catalogData.files.forEach( function( fileName, fileId, fileArr) {
		dt = dt + "<com:mtomFile><com:name>" + catalogData.folder + "\\" + fileName + "</com:name></com:mtomFile>";
	});
	
	dt = dt + "</com:files></com:communication></com:catalog></soap:Body></soap:Envelope>";

	fs.writeFile( path.join(catalogData.uploadDir, 'theEnd.xml'), 
		dt, 
		function (err) {
			if (err) throw err;
			console.log('It\'s saved!');
			
			
		});
	theEnd(catalogData, res);
	
  });

  // parse the incoming request containing the form data
  form.parse(req);
	return;
	
	
};

/* GET users listing. */
router.get('/', function(req, res, next) {
  //res.send('respond with a resource');

  exec('find "ls"', function (error, stdout, stderr) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write(stdout);
    response.end();
  });  

});

router.get('/ping', function(req, res){
  res.send('pong')
});

router.get('/test', function(req, res){

	var dir = "\\\\smosfs04\\UserHome\\UserHome\\osirik";
	//var dir ="\\\\smosfs04\\SystemFiles\\SystemFiles\\SystemFiles\\Interfaces\\UploadingFiles\\2013\\12\\06";
	
	var data = req.body;
	
	console.log("Going to read directory " + dir);

	var filesa = [];
	
	fs.readdir(dir ,function(err, files){
		if (err) {
			return console.error(err);
		}
		
		res.writeHead(200, {"Content-Type": "text/json"});   

		files.forEach( function (file){
			var fl = dir + "\\" + file;
			console.log( fl );
			filesa.push({fls:fl});
			
			fs.stat( fl, function (err, stats) {
			if (err) {
				return console.error(err);
			}   
			
			console.log(stats);
			
			filesa.push({ fls: "23523523234" });
			
			filesa.push({
				fls: {
					name: "file",
					isFile: stats.isFile(),
					isDirectory: stats.isDirectory(),
					isBlockDevice: stats.isBlockDevice(),
					isCharacterDevice: stats.isCharacterDevice(),
					isSymbolicLink: stats.isSymbolicLink(),
					isFIFO: stats.isFIFO(),
					isSocket: stats.isSocket()
				}});
			});
		});
		
		console.log( "END" );
		res.write( JSON.stringify( filesa, null, 4) );
		res.end();
	});
});

function getFileForm(pCnId, pPlId, pClId, pComm) {

/*
router.get('/', function(req, res, next) {
  res.render('disc_fs_cn', { title: 'Express' });
});
*/

var frm = '<form action="http://w341:3000/atlantis/v1/fs/file_upload" method="post" enctype="multipart/form-data">';
  
    if (pCnId != undefined) frm = frm + '<input type="text" name="contactId" value="'+ pCnId + '">';
	if (pPlId != undefined) frm = frm + '<input type="text" name="policyId" value="' +pPlId + '">';
	if (pClId != undefined) frm = frm + '<input type="text" name="claimId" value="' +pClId + '">';
	
	frm = frm +
    pComm + '<br/>' + '<input id="commName"  type="text" value="' + pComm + '" />' +
    '<input id="upload-input" type="file" name="uploads[]" multiple="multiple"></br>' + 
    '<input type="submit" value="Send">' +
    '</form>';
return frm;
}

function fn_file_upload (reqData, res) {
	if ( reqData.systemModule == 'CONTACT' ) {
		res.render('disc_fs_cn', { contactId: reqData.contactId });
	} else if ( reqData.systemModule == 'POLICY' ) {
		res.render('disc_fs_pl', { contactId: reqData.contactId, policyId: reqData.policyId });
	} else if ( reqData.systemModule == 'CLAIM' ) {
		res.render('disc_fs_cl', { contactId: reqData.contactId, policyId: reqData.policyId, claimId: reqData.claimId });
	} else {
        res.writeHead(400, {"Content-Type": "text/plain"});
        res.end("ERROR File does NOT Exists. Module="+reqData.systemModule);
    }
}

router.post('/file_upload',  function (req, res ) {

	upload_fl(req, res , fn_file_upload );
})

router.get('/file_upload', function (req, res ) {
	var reqData = {};
	reqData.systemModule = req.query.systemModule;
	reqData.contactId = req.query.contactId;
	reqData.policyId = req.query.policyId;
	reqData.claimId = req.query.claimId;
	
	fn_file_upload( reqData, res );  
});


function responseFile(fileName, response) {
	var filePath =  fileName;
	var flName = path.basename(fileName);

  // Check if file specified by the filePath exists 
  fs.exists(filePath, function(exists){
      if (exists) {     
        // Content-type is very interesting part that guarantee that
        // Web browser will handle response in an appropriate manner.
        response.writeHead(200, {
          "Content-Type": "application/octet-stream",
          "Content-Disposition" : 'attachment; filename="' + flName + '"' });
        fs.createReadStream(filePath).pipe(response);
      } else {
        response.writeHead(400, {"Content-Type": "text/plain"});
        response.end("ERROR File does NOT Exists");
      }
    });
  }
  
router.get('/file',  function (req, res ) {
	var fl_name  = req.query.nm;
	if (fl_name != undefined) {
		responseFile(fl_name, res);
	} else {
        res.writeHead(400, {"Content-Type": "text/plain"});
        res.end("ERROR File does NOT Exists");		
	}
});

router.get('/files', function(req, res){

	var path = "\\\\smosfs04\\UserHome\\UserHome\\osirik";
	//var dir ="\\\\smosfs04\\SystemFiles\\SystemFiles\\SystemFiles\\Interfaces\\UploadingFiles\\2013\\12\\06";
	
	console.log("Going to read directory " + path);
	
	var fls = getDir(path);
	console.log(fls.length);
	
	res.send(fls);
});

function getDir(pDir) {

	var dirFls = [];
	
	fs.readdir(pDir ,function(err, files){
		
		for (var i=0; i< files.length; i++) {

			var fl = pDir + "\\" + files[i];
console.log(fl);
			fs.stat( fl, function(f) {
				return function (err, stats) {
				if (err) {return console.error(err);}   
			
				dirFls.push({
					fls: {
						name: files[i],
						isFile: stats.isFile(),
						isDirectory: stats.isDirectory(),
						isBlockDevice: stats.isBlockDevice(),
						isCharacterDevice: stats.isCharacterDevice(),
						isSymbolicLink: stats.isSymbolicLink(),
						isFIFO: stats.isFIFO(),
						isSocket: stats.isSocket()
					}});
			}}(fl));

		}
		console.log("END");
		return dirFls;	
	})
	return;
}


module.exports = router;
