var soap = require('soap');

exports.NVL = NVL;
exports.decodeArray1 = decodeArray1;
exports.decodeArrayByOID = decodeArrayByOID;
exports.convert2discContacts = convert2discContacts;

exports.callReleaseWS = callReleaseWS;
exports.getWSDL = getWSDL;

exports.datePlusYear = datePlusYear;


var t_ids = [{nm:"passport", id:"123"},{nm:"passport1", id:"222"}];
var t_sex = [{nm:"male", id:"1"},{nm:"female", id:"2"}];

function getWSDL(server) {
	if ( server == "release" ) { return "http://smosdsc03:7001/services/services/Insurance?wsdl"; } 
	if ( server == "uat" ) { return "http://smosdsc15:7001/services/services/Insurance?wsdl"; }
}

function datePlusYear(pdate) {
	var date2 = new Date(pdate);
	date2.setFullYear(date2.getFullYear() + 1);
	
	return date2.toISOString();
}

function NVL(val1, val2) {
	if ( val1 == undefined  ) return val2;
	return val1;
	}

function decodeArray1(array1, findVal, ifNotFound) {

	for (var i = 0; i < array1.length; i++){
        if (array1[i].nm == findVal){
			return array1[i].id; 
		}
	}
	ifNotFound(findVal);
}

function decodeArrayByOID(array1, oid, ifNotFound) {

	for (var i = 0; i < array1.length; i++){
        if (array1[i].id == oid){
			return array1[i].nm; 
		}
	}
	return oid;
	ifNotFound(findVal);
}

function convert2discContacts(contacts, ifError) {
	
	for (var i = 0; i < contacts.length; i++){
        contacts[i].discDocId = decodeArray1( t_ids, contacts[i].document.type, ifError);

		contacts[i].discSexId = decodeArray1( t_sex, contacts[i].gender, ifError );

	}
	return contacts;
}


function callReleaseWS(disc, respOk, respErr) {
	var url = "http://smosdsc03:7001/services/services/Insurance?wsdl";

	// без этого не работает. namespace
	var options = { 
		ignoredNamespaces: {
			namespaces: ['targetNamespace', 'typedNamespace'],
			override: true
		}
	}
console.log('to release');	

	soap.createClient(url,options, function(err,client){
		
	if(err)
		console.error(err);
	else {

		client.setSecurity(new soap.BasicAuthSecurity('WebInsurer_COM_CHANNEL_1', 'aaaa1111'));
		client.insuranceService.InsuranceServiceImplPort.calculatePolicyTravel(disc,function(err,response){

			//respErr( client.lastRequest );
			// ***
			if(err) {
				respErr(err);
			}
			else {
				//console.log(response);
				respOk(response);
			}
		} )
	}
	});
}

function callReleaseUAT(disc, respOk, respErr) {
	var url = "http://smosdsc15:7001/services/services/Insurance?wsdl";

	// без этого не работает. namespace
	var options = { 
		ignoredNamespaces: {
			namespaces: ['targetNamespace', 'typedNamespace'],
			override: true
		}
	}

console.log('to UAT');	

	soap.createClient(url,options, function(err,client){
		
	if(err)
		console.error(err);
	else {

		client.setSecurity(new soap.BasicAuthSecurity('WebInsurer_COM_CHANNEL_1', 'aaaa1111'));
		client.insuranceService.InsuranceServiceImplPort.calculatePolicyTravel(disc,function(err,response){

			//respErr( client.lastRequest );
			// ***
			if(err) {
				respErr(err);
			}
			else {
				//console.log(response);
				respOk(response);
			}
		} )
	}
	});
}


