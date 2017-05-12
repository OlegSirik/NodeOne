var express = require('express');
var router = express.Router();
var utl = require('./utl');
var soap = require('soap');

var t_curr = [{nm:"EUR", id:"oid:1"},{nm:"USD", id:"oid:2"}];
var t_sport = [{nm:"true", id:"oid:1"},{nm:"false", id:"oid:2"}];

var t_country = require('./data/t_country.json');

var nm = 0;

function getContactById(contacts, id, ifNotFound) {

	for (var i = 0; i < contacts.length; i++){
        if ( contacts[i].id == id ){

		var discContact = {
			firstName:  	contacts[i].firstName,
			secondName: 	contacts[i].lastName,
			middleName: 	contacts[i].middleName,
			gender:     	contacts[i].discSexId,
			birthDate:  	contacts[i].birthDate,
			latinFirstName: contacts[i].latinFirstName,
			latinTransName: contacts[i].latinLastName,
			
            address: {
                cityId: "2231872",
                flat: "3",
                house: "5",
                regionId: "2230090",
                streetId: "500380945"
            }
		}
		return discContact; 
		}
	}
	ifNotFound(id);
}

function calcPolicyTravel(server, disc, respOk, respErr) {
	
	var url = utl.getWSDL(server);

	// без этого не работает. namespace
	var options = { 
		ignoredNamespaces: {
			namespaces: ['targetNamespace', 'typedNamespace'],
			override: true
		}
	}
console.log('to ' + server);	

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

function savePolicyTravel(server, disc, respOk, respErr) {
	
	var url = utl.getWSDL(server);

	// без этого не работает. namespace
	var options = { 
		ignoredNamespaces: {
			namespaces: ['targetNamespace', 'typedNamespace'],
			override: true
		}
	}
console.log('to ' + server);	

	soap.createClient(url,options, function(err,client){
		
	if(err)
		console.error(err);
	else {

		client.setSecurity(new soap.BasicAuthSecurity('WebInsurer_COM_CHANNEL_1', 'aaaa1111'));
		client.insuranceService.InsuranceServiceImplPort.savePolicyTravel(disc,function(err,response){

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


function decodeBigCover(coverIn) {
	try {
		var coverOut = 
			{ 
				name: coverIn.coverOptions.option[0].description,
				yearlyPremium:  coverIn.yearlyPremium,
				insuranceAmount:  coverIn.insuranceAmount.$value
			}
		} catch (e) {
		var coverOut = 
			{ 
				name: coverIn.coverOptions.option[0].description,
				yearlyPremium:  coverIn.yearlyPremium
			}
		}
	return coverOut;
}

function disc2meta ( policy, disc ) {

	policy.packages = disc.packetList.length;
	
	policy.packageList = [];
	
	disc.packetList.forEach(function( discPackage, packageId, packageArr) {
		var pkg = {};
		
		pkg.name = discPackage.description ; //": "Зимний пакет (Россия)",
        pkg.nr = discPackage.formulaId; //": 742,
        //"numberOfPayments": 0,
        pkg.id = discPackage.packetId; //": 40011328,
        pkg.totalPremium = discPackage.totalPremium; //": "195.54"
		
		pkg.cvrLength = discPackage.cover.length;
		pkg.covers = [];
		
		discPackage.cover.forEach(function(cover, i, arr) {
		
		var coverRet = [];
			
		
		switch (cover.productLine.typeId) {
			case 40070655:
				//  валюта договора
				var vCurr = [];

				cover.coverOptions.option.forEach(function(option1, i, arr) {
					
					if (option1.selected == true) { 
						vCurr.unshift (  utl.decodeArrayByOID(t_curr, option1.key, function err(err){} )  ); 
						} else { 
						vCurr.push    (  utl.decodeArrayByOID(t_curr, option1.key, function err(err){} )  ); 
					}
				});
				
				pkg.insuredCurr = vCurr;
				break;
			case 5151547:
				// скидка по купону
//				console.log(cover.productLine.typeId + ':cupon discount');
				break;
			case 5412739:
// скидка 
				console.log('discount:' + cover.excessAmount.$value);

//				cover.coverOptions.option.forEach(function(option780, i, arr) {
//					if (option780.selected == true) { pheader.discount = option780.description; }
//				});
				
//				pheader.discount = cover.excessAmount.$value;
				break;
				

			case 40070646:			
				//страна #1
				var vCountry1 = [];

				cover.coverOptions.option.forEach(function(option646, i, arr) {
					
					if (option646.selected == true) { 
						vCountry1.unshift (  utl.decodeArrayByOID(t_country, option646.key, function err(err){} )  ); 
						} else { 
						vCountry1.push    (  utl.decodeArrayByOID(t_country, option646.key, function err(err){} )  ); 
					}
				});
				
				pkg.insuredCountry1 = vCountry1;

				break;

			case 40070647:
				//страна #2
				var vCountry2 = [];

				cover.coverOptions.option.forEach(function(option647, i, arr) {
					
					if (option647.selected == true) { 
						vCountry1.unshift (  utl.decodeArrayByOID(t_country, option647.key, function err(err){} )  ); 
						} else { 
						vCountry1.push    (  utl.decodeArrayByOID(t_country, option647.key, function err(err){} )  ); 
					}
				});
				
				pkg.insuredCountry2 = vCountry2;
				break;

			case 40070648:
				//страна #3
				var vCountry3 = [];

				cover.coverOptions.option.forEach(function(option648, i, arr) {
					
					if (option647.selected == true) { 
						vCountry1.unshift (  utl.decodeArrayByOID(t_country, option648.key, function err(err){} )  ); 
						} else { 
						vCountry1.push    (  utl.decodeArrayByOID(t_country, option648.key, function err(err){} )  ); 
					}
				});
				
				pkg.insuredCountry3 = vCountry3;
				break;

			case 40070656:
				//days
				var vDays = [];
//				console.log(cover.productLine.typeId + ':days');
				
				cover.coverOptions.option.forEach(function(option656, i, arr) {
					if (option656.selected == true) { 
						vDays.unshift ( option656.description ); 
					} else {
						vDays.push ( option656.description ); 
					}
				});
				pkg.days = vDays;
				break;
			case 40070657:
//Кол-во покрытых дней
//				console.log(cover.productLine.typeId + ':days2');
				
				break;

			case 40070660:
//sport
			var vSport = [];
//				console.log(cover.productLine.typeId + ':sport');
				
				cover.coverOptions.option.forEach(function(option660, i, arr) {
					if (option660.selected == true) { 
						vSport.unshift ( utl.decodeArrayByOID(t_sport, option660.key, function err(err){} ) ); 
					} else {
						vSport.push ( utl.decodeArrayByOID(t_sport, option660.key, function err(err){} ) );
					}
				});
				pkg.sportIncluded = vSport;
				break;
			case 40070661:				
//				console.log(cover.productLine.typeId + ':medical cover');
//				pheader.medicalCare = decodeBigCover(cover);
				break;
			case 40070662:				
//				console.log(cover.productLine.typeId + ':medical total cover');
				//policy.medicalTotal = decodeBigCover(cover);
				break;
			case 40070671:				
//				console.log(cover.productLine.typeId + ':stomatolog cover');
//				pheader.stomatology = decodeBigCover(cover);
				break;

			case 40070673:				
//				console.log(cover.productLine.typeId + ':repatriation cover');
//				pheader.repatriationIncaseofDeath = decodeBigCover(cover);
				break;
			case 40070675:				
//				console.log(cover.productLine.typeId + ':med transport cover');
//				pheader.medicalTransportation = decodeBigCover(cover);
				break;
			case 40070677:				
//				console.log(cover.productLine.typeId + ':travelInteraption cover');
//				pheader.tripInterruption = decodeBigCover(cover);
				break;
			case 40070679:				
//				console.log(cover.productLine.typeId + ':child evacuation cover');
//				pheader.childrenEvacuation  = decodeBigCover(cover);
				break;
			case 40070681:				
//				console.log(cover.productLine.typeId + ':phone calls cover');
//				pheader.phoneCalls = decodeBigCover(cover);
				break;
			case 40070683:				
//				console.log(cover.productLine.typeId + ':3face cover');
//				pheader.thirdPartyVisit = decodeBigCover(cover);
				break;
			case 40070685:				
//				console.log(cover.productLine.typeId + ':flay delay cover');
//				pheader.flightDelay = decodeBigCover(cover);
				break;
			case 40070688:				
//				console.log(cover.productLine.typeId + ':flay delay hourly cover');
				//pheader.flightDelayHourly = decodeBigCover(cover);
				break;
			case 40070689:				
//				console.log(cover.productLine.typeId + ':VZR.AdditionalExpensesCover cover');
				//pheader.additionalExpensesCover = decodeBigCover(cover);
				break;
			case 40070690:				
//				console.log(cover.productLine.typeId + ':Jud help cover');
//				pheader.legalAid = decodeBigCover(cover);
				break;
			case 40070692:				
//				console.log(cover.productLine.typeId + ':Lost docs cover');
//				pheader.lossOfDocuments = decodeBigCover(cover);
				break;
				
			//Курс валюты на момент продажи/изменения
			case 40070718:				
//				console.log(cover.productLine.typeId + ':Currency rate cover');
				//policy.lostDocs = decodeBigCover(cover);
				break;
			//Сервисная компания: Европ Ассистанс
			case 5412779:				
//				console.log(cover.productLine.typeId + ':Service Europa cover');
				//policy.lostDocs = decodeBigCover(cover);
				break;
			//Комиссия партнера
			case 5411796:				
//				console.log(cover.productLine.typeId + ':Commision cover');
				//policy.lostDocs = decodeBigCover(cover);
				break;
				
			case 40070694:				
//				console.log(cover.productLine.typeId + ':Lost laggage cover');
//				pheader.lossOfLaggage = decodeBigCover(cover);
				break;
			case 40070698:
//				console.log(cover.productLine.typeId + ':Accident cover');
//				pheader.accident = decodeBigCover(cover);
				break;
			//Гражданская ответственность
			case 40070706:
//				console.log(cover.productLine.typeId + ':GO cover');
//				pheader.tpl = decodeBigCover(cover);
				break;
			//RealEndDay
			case 40070720:
//				console.log(cover.productLine.typeId + ':RealEndDay cover');
				//policy.tpl = decodeBigCover(cover);
				break;
			//VZR.CustomValidationWarning_TechCover
			case 5600501:
//				console.log(cover.productLine.typeId + ':CustomValidationWarning_TechCover cover');
				//policy.tpl = decodeBigCover(cover);
				break;
			
			default:
//				console.log(cover.productLine.typeId);
				break;
		}
		console.log("PUSH");
		pkg.covers.push( coverRet );
	});

		policy.packageList.push(pkg);
	});
	
	policy.result = disc;
}

function disc2data ( policy, disc ) {
	
	var packet = disc.packetList[0];
	
	console.log(packet.description);
	
	policy.package = packet.description;
	//policy.formulaId = packet.formulaId;
	//policy.numberOfPayments = packet.numberOfPayments;
	//policy.packetId = packet.packetId;
	policy.totalPremium = packet.totalPremium;    
	
	var pheader = {};
	
	var covers = packet.cover;
	
	covers.forEach(function(cover, i, arr) {
		
		switch (cover.productLine.typeId) {
			case 40070655:
				//  валюта договора
//				console.log(cover.productLine.typeId + ':CUR');
				cover.coverOptions.option.forEach(function(option1, i, arr) {
					if (option1.selected == true) { pheader.insuredCurSelected = option1.description; }
				});
				break;
			case 5151547:
				// скидка по купону
//				console.log(cover.productLine.typeId + ':cupon discount');
				break;
			case 5412739:
// скидка 
				console.log('discount:' + cover.excessAmount.$value);

//				cover.coverOptions.option.forEach(function(option780, i, arr) {
//					if (option780.selected == true) { pheader.discount = option780.description; }
//				});
				
				pheader.discount = cover.excessAmount.$value;
				break;
				

			case 40070646:			
				//страна #1
//				console.log(cover.productLine.typeId + ':country#1');
				
				cover.coverOptions.option.forEach(function(option646, i, arr) {
					if (option646.selected == true) { pheader.insuredCnt1Selected = option646.description; }
				});
				break;

			case 40070647:
				//страна #2
//				console.log(cover.productLine.typeId + ':country#2');
				
				cover.coverOptions.option.forEach(function(option647, i, arr) {
					if (option647.selected == true) { pheader.insuredCnt2Selected = option647.description; }
				});
				break;

			case 40070648:
				//страна #3
//				console.log(cover.productLine.typeId + ':country#3');
				
				cover.coverOptions.option.forEach(function(option648, i, arr) {
					if (option648.selected == true) { pheader.insuredCnt3Selected = option648.description; }
				});
				break;

			case 40070656:
				//days
//				console.log(cover.productLine.typeId + ':days');
				
				cover.coverOptions.option.forEach(function(option656, i, arr) {
					if (option656.selected == true) { pheader.insuredDaysSelected = option656.description; }
				});
				break;
			case 40070657:
//Кол-во покрытых дней
//				console.log(cover.productLine.typeId + ':days2');
				
				break;

			case 40070660:
//sport
//				console.log(cover.productLine.typeId + ':sport');
				
				cover.coverOptions.option.forEach(function(option660, i, arr) {
					if (option660.selected == true) { pheader.insuredSportSelected = option660.description; }
				});
				break;
			case 40070661:				
//				console.log(cover.productLine.typeId + ':medical cover');
				pheader.medicalCare = decodeBigCover(cover);
				break;
			case 40070662:				
//				console.log(cover.productLine.typeId + ':medical total cover');
				//policy.medicalTotal = decodeBigCover(cover);
				break;
			case 40070671:				
//				console.log(cover.productLine.typeId + ':stomatolog cover');
				pheader.stomatology = decodeBigCover(cover);
				break;

			case 40070673:				
//				console.log(cover.productLine.typeId + ':repatriation cover');
				pheader.repatriationIncaseofDeath = decodeBigCover(cover);
				break;
			case 40070675:				
//				console.log(cover.productLine.typeId + ':med transport cover');
				pheader.medicalTransportation = decodeBigCover(cover);
				break;
			case 40070677:				
//				console.log(cover.productLine.typeId + ':travelInteraption cover');
				pheader.tripInterruption = decodeBigCover(cover);
				break;
			case 40070679:				
//				console.log(cover.productLine.typeId + ':child evacuation cover');
				pheader.childrenEvacuation  = decodeBigCover(cover);
				break;
			case 40070681:				
//				console.log(cover.productLine.typeId + ':phone calls cover');
				pheader.phoneCalls = decodeBigCover(cover);
				break;
			case 40070683:				
//				console.log(cover.productLine.typeId + ':3face cover');
				pheader.thirdPartyVisit = decodeBigCover(cover);
				break;
			case 40070685:				
//				console.log(cover.productLine.typeId + ':flay delay cover');
				pheader.flightDelay = decodeBigCover(cover);
				break;
			case 40070688:				
//				console.log(cover.productLine.typeId + ':flay delay hourly cover');
				//pheader.flightDelayHourly = decodeBigCover(cover);
				break;
			case 40070689:				
//				console.log(cover.productLine.typeId + ':VZR.AdditionalExpensesCover cover');
				//pheader.additionalExpensesCover = decodeBigCover(cover);
				break;
			case 40070690:				
//				console.log(cover.productLine.typeId + ':Jud help cover');
				pheader.legalAid = decodeBigCover(cover);
				break;
			case 40070692:				
//				console.log(cover.productLine.typeId + ':Lost docs cover');
				pheader.lossOfDocuments = decodeBigCover(cover);
				break;
				
			//Курс валюты на момент продажи/изменения
			case 40070718:				
//				console.log(cover.productLine.typeId + ':Currency rate cover');
				//policy.lostDocs = decodeBigCover(cover);
				break;
			//Сервисная компания: Европ Ассистанс
			case 5412779:				
//				console.log(cover.productLine.typeId + ':Service Europa cover');
				//policy.lostDocs = decodeBigCover(cover);
				break;
			//Комиссия партнера
			case 5411796:				
//				console.log(cover.productLine.typeId + ':Commision cover');
				//policy.lostDocs = decodeBigCover(cover);
				break;
				
			case 40070694:				
//				console.log(cover.productLine.typeId + ':Lost laggage cover');
				pheader.lossOfLaggage = decodeBigCover(cover);
				break;
			case 40070698:
//				console.log(cover.productLine.typeId + ':Accident cover');
				pheader.accident = decodeBigCover(cover);
				break;
			//Гражданская ответственность
			case 40070706:
//				console.log(cover.productLine.typeId + ':GO cover');
				pheader.tpl = decodeBigCover(cover);
				break;
			//RealEndDay
			case 40070720:
//				console.log(cover.productLine.typeId + ':RealEndDay cover');
				//policy.tpl = decodeBigCover(cover);
				break;
			//VZR.CustomValidationWarning_TechCover
			case 5600501:
//				console.log(cover.productLine.typeId + ':CustomValidationWarning_TechCover cover');
				//policy.tpl = decodeBigCover(cover);
				break;
			
			default:
//				console.log(cover.productLine.typeId);
				break;
		}
	});
	
	policy.header_out = pheader;
	policy.olddata = disc;
}

function prepareWSRequest(reqData) {

	var errors = [];
	var retData = reqData;
	var cover = [];

//  валюта договора
	var vCurr = utl.decodeArray1( t_curr, retData.policy.header.insuredCur,
		function(val) { errors.push("invalid policy.ph.gender value: " + retData.policy.ph.gender ); } );
	cover.push({                        
        productLine: { typeId: "40070655" },
        selectedCoverOption: { key: vCurr }
	});

//vSport
	var vSport = utl.decodeArray1( t_sport, retData.policy.header.sportIncluded,
		function(val) { errors.push("invalid policy.sportIncluded value: " + retData.policy.header.sportIncluded ); } );
	cover.push({                        
        productLine: { typeId: "40070660" },
        selectedCoverOption: { key: vSport }
	});

// Страна1
	var vCountry1 = utl.decodeArray1( t_country, retData.policy.header.insuredCountries[0],
		function(val) { errors.push("invalid policy.country1 value: " + retData.policy.header.insuredCountries[0] ); } );
	cover.push({
		productLine: { typeId: "40070646" },  
        selectedCoverOption: { key: vCountry1 }
    });

// Страна2
	if ( retData.policy.header.insuredCountries.length > 1) {
		var vCountry2 = utl.decodeArray1( t_country, retData.policy.header.insuredCountries[1],
			function(val) { errors.push("invalid policy.country2 value: " + retData.policy.header.insuredCountries[1] ); } );
		cover.push({
			productLine: { typeId: "40070647" },  
			selectedCoverOption: { key: vCountry2 }
		});
	}

// Страна3
	if ( retData.policy.header.insuredCountries.length > 2) {
		var vCountry3 = utl.decodeArray1( t_country, retData.policy.header.insuredCountries[2],
			function(val) { errors.push("invalid policy.country2 value: " + retData.policy.header.insuredCountries[2] ); } );
		cover.push({
			productLine: { typeId: "40070648" },  
			selectedCoverOption: { key: vCountry3 }
        });
	}

// страховая сумма		
	cover.push({
		enteredInsuranceAmount: retData.policy.header.insuredSum,
        productLine : { typeId: "40070661" },
        selectedCoverOption: { key: "oid:1" }
		});

// Количестов покрытых дней               -->
	cover.push({            
        productLine: { typeId: "40070656" },
        selectedCoverOption: { key: "oid:" + retData.policy.header.insuredDays }
		});

// Скидка
	cover.push({            
        productLine: { typeId: "5412739" },
        selectedCoverOption: { key: "oid:2" }
		,enteredExcessAmount: retData.policy.header.discount 
		});

// необязательные покрытия
// "Потеря багажа" -> 40070694
// "Несчастный случай" -> 40070698
// "Гражданская ответственность" -> 40070706

	retData.policy.header.lossOfLaggage = utl.NVL(retData.policy.header.lossOfLaggage, "false");
	retData.policy.header.accident = utl.NVL(retData.policy.header.accident, "false");
	retData.policy.header.tpl = utl.NVL(retData.policy.header.tpl, "0");
	
	if ( retData.policy.header.lossOfLaggage == "true" ) {
	cover.push({            
        productLine: { typeId: "40070694" },
        selectedCoverOption: { key: "oid:1" }
		});
	}

	if ( retData.policy.header.accident == "true" ) {
	cover.push({            
        productLine: { typeId: "40070698" },
        selectedCoverOption: { key: "oid:1" }
		});
	}

	if ( retData.policy.header.tpl != "0" ) {
	cover.push({            
        productLine: { typeId: "40070706" },
        selectedCoverOption: { key: "oid:1" },
		enteredInsuranceAmount: retData.policy.header.tpl
		});
	}
//
	retData.contacts = utl.convert2discContacts( retData.contacts,
		function(val) { errors.push("invalid policy.ph.document.type value "); });
	
	var cnPh = getContactById(retData.contacts, retData.policy.phId, 
		function(val) { errors.push("invalid policy.phid value: " ); } );
	
	cnPh.policyHolder = "true";
	
	var travelMember = [];
	
	for (var i = 0; i < retData.policy.listOfInsured.length; i++){
		travelMember.push( getContactById( retData.contacts, retData.policy.listOfInsured[i], 
		function(val) { errors.push("invalid policy.phid value: " + retData.policy.phId ); } )); 
	}

	retData.cover = cover;
	retData.cnPh = cnPh;
	retData.travelMember = travelMember;
	retData.error = errors; 
	//data.error = errors;
	
	return retData;
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/ping', function(req, res){
  res.send('pong')
});

router.post('/quote', function(req, res){

	//var data = req.body;
	var dataFull = {};
	dataFull = prepareWSRequest(req.body);
	
	if ( dataFull.error.length > 0 ) { res.send(dataFull) }
	else {

		nm = nm + 1;
		
		var travelMember = [];
		travelMember = dataFull.travelMember;

		var cover = [];
		cover = dataFull.cover;
		
		var disc = 
		{ policy: {
			attnQuestionId: dataFull.policy.header.attn,        
		
			policyStartDate:	dataFull.policy.header.startDate,
			validUntil:			utl.datePlusYear(dataFull.policy.header.startDate),

			//userId: "2210000",
			userId: "20418",
			interfaceVersion: "V_2_16",

			delivery:"2015-12-16T11:45:40.115+04:00",
			enteredDeliveryType:"PAID_COURIER_DELIVERY",
			includeDebugInfo:"false",

			paymentMethod: "40000000",        
        
			packagesForCalc: dataFull.policy.header.package,
			status:"15",
		
			contact: dataFull.cnPh,            
		
			travel: { travelMember },
			covers: { cover }
		}};

		var responceData = {}
		
		if (dataFull.srv == 'release') {

			calcPolicyTravel( "release", disc, 
				function (responce){
					disc2data ( responceData, responce.return );
					//res.send( responce.return);
					nm = nm - 1;
					console.log('post:' + nm);
					res.send(responceData);
				},
				function (err){
					nm = nm - 1;
					console.log('post:' + nm);
					res.send(err)
				}); } else 
		{
			calcPolicyTravel( "uat", disc, 
				function (responce){
					disc2data ( dataFull, responce.return );
					//res.send( responce.return);
					nm = nm - 1;
					console.log('post:' + nm);
					res.send(dataFull);
				},
				function (err){
					nm = nm - 1;
					console.log('post:' + nm);
					res.send(err)
				});
		}
	}
		
});

router.post('/meta', function(req, res){

	var dataFull = {};
	dataFull = prepareWSRequest(req.body);
	
	if ( dataFull.error.length > 0 ) { res.send(dataFull) }
	else {

		nm = nm + 1;
		
		var travelMember = [];
		travelMember = dataFull.travelMember;

		var cover = [];
		cover = dataFull.cover;
		
		var disc = 
		{ policy: {
			attnQuestionId: dataFull.policy.header.attn,        
		
			policyStartDate:	dataFull.policy.header.startDate,
			validUntil:			utl.datePlusYear(dataFull.policy.header.startDate),

			//userId: "2210000",
			userId: "20418",
			interfaceVersion: "V_2_16",

			delivery:"2015-12-16T11:45:40.115+04:00",
			enteredDeliveryType:"PAID_COURIER_DELIVERY",
			includeDebugInfo:"false",

			paymentMethod: "40000000",        
        
			//packagesForCalc: dataFull.policy.header.package,
			status:"15",
		
			contact: dataFull.cnPh,            
		
			travel: { travelMember }
			//covers: { cover }
		}};

		var responceData = {}
		
		if (dataFull.srv == 'release') {

			calcPolicyTravel( "release", disc, 
				function (responce){
					disc2meta ( responceData, responce.return );
					//res.send( responce.return);
					nm = nm - 1;
					console.log('post:' + nm);
					res.send(responceData);
				},
				function (err){
					nm = nm - 1;
					console.log('post:' + nm);
					res.send(err)
				}); } else 
		{
			calcPolicyTravel( "uat", disc, 
				function (responce){
					disc2data ( dataFull, responce.return );
					//res.send( responce.return);
					nm = nm - 1;
					console.log('post:' + nm);
					res.send(dataFull);
				},
				function (err){
					nm = nm - 1;
					console.log('post:' + nm);
					res.send(err)
				});
		}
	}
		
});

router.post('/save', function(req, res){

	//var data = req.body;
	var dataFull = {};
	dataFull = prepareWSRequest(req.body);
	
	if ( dataFull.error.length > 0 ) { res.send(dataFull) }
	else {

		nm = nm + 1;
		
		var travelMember = [];
		travelMember = dataFull.travelMember;

		var cover = [];
		cover = dataFull.cover;
		
		var disc = 
		{ policy: {
			attnQuestionId: dataFull.policy.header.attn,        
		
			policyStartDate:	dataFull.policy.header.startDate,
			validUntil:			utl.datePlusYear(dataFull.policy.header.startDate),

			//userId: "2210000",
			userId: "20418",
			interfaceVersion: "V_2_16",

			delivery:"2015-12-16T11:45:40.115+04:00",
			enteredDeliveryType:"PAID_COURIER_DELIVERY",
			includeDebugInfo:"false",

			paymentMethod: "40000000",        
        
			packagesForCalc: dataFull.policy.header.package,
			status:"15",
		
			contact: dataFull.cnPh,            
		
			travel: { travelMember },
			covers: { cover }
		}};

		var responceData = {}
		
		if (dataFull.srv == 'release') {

			savePolicyTravel( "release", disc, 
				function (responce){
					//disc2data ( responceData, responce.return );
					//res.send( responce.return);
					nm = nm - 1;
					console.log('post:' + nm);
					res.send(responce.return);
					//res.send(responceData);
				},
				function (err){
					nm = nm - 1;
					console.log('post:' + nm);
					res.send(err)
				}); } else 
		{
			savePolicyTravel( "uat", disc, 
				function (responce){
					disc2data ( dataFull, responce.return );
					//res.send( responce.return);
					nm = nm - 1;
					console.log('post:' + nm);
					res.send(dataFull);
				},
				function (err){
					nm = nm - 1;
					console.log('post:' + nm);
					res.send(err)
				});
		}
	}
		
});

module.exports = router;
