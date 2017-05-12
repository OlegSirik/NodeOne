var express = require('express');
var router = express.Router();
var soap = require('soap');

var t_ids = [{nm:"passport", id:"123"},{nm:"passport1", id:"222"}];
var t_sex = [{nm:"male", id:"1"},{nm:"female", id:"2"}];
var t_curr = [{nm:"EUR", id:"oid:1"},{nm:"USD", id:"oid:2"}];
var t_sport = [{nm:"true", id:"oid:1"},{nm:"false", id:"oid:2"}];

var t_country = require('./data/t_country.json');

var nm = 0;

function decodeArray1(array1, findVal, ifNotFound) {

	for (var i = 0; i < array1.length; i++){
        if (array1[i].nm == findVal){
			return array1[i].id; 
		}
	}
	ifNotFound(findVal);
}

function decodeArray2(array1, findVal) {

	for (var i = 0; i < array1.length; i++){
        if (array1[i].id == findVal){
			return array1[i].name; 
		}
	}
	return "not_found";
}

function decodeBigCover(coverIn) {
/*

          {
            "coverOptions": {
              "option": [
                {
                  "description": "Потеря багажа",
                  "key": "oid:1",
                  "selected": true
                }
              ]
            },
            "coverTypeId": 3,
            "dailyPremium": "0.0",
            "insuranceAmount": {
              "attributes": {
                "enterType": "CALCULATE"
              },
              "$value": "0"
            },
            "manualAmount": "0.0",
            "premiumForCollAmount": "0.0",
            "productLine": {
              "groupId": 5014,
              "typeId": 40070694
            },
            "yearlyPremium": "0.0"
          },
		  
*/
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
				console.log(cover.productLine.typeId + ':CUR');
				cover.coverOptions.option.forEach(function(option1, i, arr) {
					if (option1.selected == true) { pheader.insuredCurSelected = option1.description; }
				});
				break;
			case 5151547:
				// скидка по купону
				console.log(cover.productLine.typeId + ':cupon discount');
				break;
			case 5412739:
				// скидка 
				console.log(cover.productLine.typeId + ':discount');
				break;
				

			case 40070646:			
				//страна #1
				console.log(cover.productLine.typeId + ':country#1');
				
				cover.coverOptions.option.forEach(function(option646, i, arr) {
					if (option646.selected == true) { pheader.insuredCnt1Selected = option646.description; }
				});
				break;

			case 40070647:
				//страна #2
				console.log(cover.productLine.typeId + ':country#2');
				
				cover.coverOptions.option.forEach(function(option647, i, arr) {
					if (option647.selected == true) { pheader.insuredCnt2Selected = option647.description; }
				});
				break;

			case 40070648:
				//страна #3
				console.log(cover.productLine.typeId + ':country#3');
				
				cover.coverOptions.option.forEach(function(option648, i, arr) {
					if (option648.selected == true) { pheader.insuredCnt3Selected = option648.description; }
				});
				break;

			case 40070656:
				//days
				console.log(cover.productLine.typeId + ':days');
				
				cover.coverOptions.option.forEach(function(option656, i, arr) {
					if (option656.selected == true) { pheader.insuredDaysSelected = option656.description; }
				});
				break;
			case 40070657:
				//Кол-во покрытых дней
				console.log(cover.productLine.typeId + ':days2');
				
				break;

			case 40070660:
				//sport
				console.log(cover.productLine.typeId + ':sport');
				
				cover.coverOptions.option.forEach(function(option660, i, arr) {
					if (option660.selected == true) { pheader.insuredSportSelected = option660.description; }
				});
				break;
				
			case 40070661:				
				console.log(cover.productLine.typeId + ':medical cover');
				pheader.medicalCare = decodeBigCover(cover);
				break;
			case 40070662:				
				console.log(cover.productLine.typeId + ':medical total cover');
				//policy.medicalTotal = decodeBigCover(cover);
				break;
			case 40070671:				
				console.log(cover.productLine.typeId + ':stomatolog cover');
				pheader.stomatology = decodeBigCover(cover);
				break;

			case 40070673:				
				console.log(cover.productLine.typeId + ':repatriation cover');
				pheader.repatriationIncaseofDeath = decodeBigCover(cover);
				break;
			case 40070675:				
				console.log(cover.productLine.typeId + ':med transport cover');
				pheader.medicalTransportation = decodeBigCover(cover);
				break;
			case 40070677:				
				console.log(cover.productLine.typeId + ':travelInteraption cover');
				pheader.tripInterruption = decodeBigCover(cover);
				break;
			case 40070679:				
				console.log(cover.productLine.typeId + ':child evacuation cover');
				pheader.childrenEvacuation  = decodeBigCover(cover);
				break;
			case 40070681:				
				console.log(cover.productLine.typeId + ':phone calls cover');
				pheader.phoneCalls = decodeBigCover(cover);
				break;
			case 40070683:				
				console.log(cover.productLine.typeId + ':3face cover');
				pheader.thirdPartyVisit = decodeBigCover(cover);
				break;
			case 40070685:				
				console.log(cover.productLine.typeId + ':flay delay cover');
				pheader.flightDelay = decodeBigCover(cover);
				break;
			case 40070688:				
				console.log(cover.productLine.typeId + ':flay delay hourly cover');
				//pheader.flightDelayHourly = decodeBigCover(cover);
				break;
			case 40070689:				
				console.log(cover.productLine.typeId + ':VZR.AdditionalExpensesCover cover');
				//pheader.additionalExpensesCover = decodeBigCover(cover);
				break;
			case 40070690:				
				console.log(cover.productLine.typeId + ':Jud help cover');
				pheader.legalAid = decodeBigCover(cover);
				break;
			case 40070692:				
				console.log(cover.productLine.typeId + ':Lost docs cover');
				pheader.lossOfDocuments = decodeBigCover(cover);
				break;
				
			//Курс валюты на момент продажи/изменения
			case 40070718:				
				console.log(cover.productLine.typeId + ':Currency rate cover');
				//policy.lostDocs = decodeBigCover(cover);
				break;
			//Сервисная компания: Европ Ассистанс
			case 5412779:				
				console.log(cover.productLine.typeId + ':Service Europa cover');
				//policy.lostDocs = decodeBigCover(cover);
				break;
			//Комиссия партнера
			case 5411796:				
				console.log(cover.productLine.typeId + ':Commision cover');
				//policy.lostDocs = decodeBigCover(cover);
				break;
				
			case 40070694:				
				console.log(cover.productLine.typeId + ':Lost laggage cover');
				pheader.lossOfLaggage = decodeBigCover(cover);
				break;
			case 40070698:
				console.log(cover.productLine.typeId + ':Accident cover');
				pheader.accident = decodeBigCover(cover);
				break;
			//Гражданская ответственность
			case 40070706:
				console.log(cover.productLine.typeId + ':GO cover');
				pheader.tpl = decodeBigCover(cover);
				break;
			//RealEndDay
			case 40070720:
				console.log(cover.productLine.typeId + ':RealEndDay cover');
				//policy.tpl = decodeBigCover(cover);
				break;
			//VZR.CustomValidationWarning_TechCover
			case 5600501:
				console.log(cover.productLine.typeId + ':CustomValidationWarning_TechCover cover');
				//policy.tpl = decodeBigCover(cover);
				break;
			
			default:
				console.log(cover.productLine.typeId);
				break;
		}
	});
	
	policy.header_out = pheader;
	policy.olddata = disc;
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
	
	soap.createClient(url,options, function(err,client){
		
	if(err)
		console.error(err);
	else {

		client.setSecurity(new soap.BasicAuthSecurity('WebInsurer_COM_CHANNEL_1', 'aaaa1111'));
		client.insuranceService.InsuranceServiceImplPort.calculatePolicyTravel(disc,function(err,response){

			//respErr( client.lastRequest );
			
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

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/ping', function(req, res){
  res.send('pong')
});

router.post('/quote', function(req, res){

var errors = [];
/*
{ 
	policy: {
		ph: {		
			firstName:"ТестСтр"
			lastName:"ТестовичСтр"
			middleName:"ТестовСтр"
			gender:"male"
			 			 
			birthDate: "1959-02-14T19:18:45.872+03:00"
			birthPlace:"Москва"
			document: {
				type:"passport"
				issueDate:""
				issuePlace
				serial:"5608"
				number:"947824"
			}
			email:"test@test.ru"
			phone:"9151111111"
			address: {}       
			latinName {
				firstName:
				lastname:
				middlename:
			}
			insured:false;
        }       
        header {
			start_date:
			end_date:
			package:standart 3 worldwide			
			insuredSum:"30000"
			insuredCur:"USD"
			insuredDays:20       
			insuredCountries:[RUS,ALG,USD]
			sportIncluded:true
			covers {
				baggageLost:true,
				incedent:false
				tripCancalation:true
				flyDelay:true
				juridicalHelp:false
				documentLoss:true
			}
		}
		insured {
			contact {

			}
		}
    errors {}
}	

*/
	var data = req.body;
	var cover = [];
	
	var vDocId = decodeArray1( t_ids, data.policy.ph.document.type, 
		function(val) { errors.push("invalid policy.ph.document.type value "); } );
	
	var vSex = decodeArray1( t_sex, data.policy.ph.gender,
		function(val) { errors.push("invalid policy.ph.gender value: " + data.policy.ph.gender ); } );

//  валюта договора
	var vCurr = decodeArray1( t_curr, data.policy.header.insuredCur,
		function(val) { errors.push("invalid policy.ph.gender value: " + data.policy.ph.gender ); } );
	cover.push({                        
        productLine: { typeId: "40070655" },
        selectedCoverOption: { key: vCurr }
		});

//vSport
	var vSport = decodeArray1( t_sport, data.policy.header.sportIncluded,
		function(val) { errors.push("invalid policy.sportIncluded value: " + data.policy.header.sportIncluded ); } );
	cover.push({                        
        productLine: { typeId: "40070660" },
        selectedCoverOption: { key: vSport }
		});

// Страна1
	var vCountry1 = decodeArray1( t_country, data.policy.header.insuredCountries[0],
		function(val) { errors.push("invalid policy.country1 value: " + data.policy.header.insuredCountries[0] ); } );
	cover.push({
		productLine: { typeId: "40070646" },  
        selectedCoverOption: { key: vCountry1 }
        });

// Страна2
	if ( data.policy.header.insuredCountries.length > 1) {
	var vCountry2 = decodeArray1( t_country, data.policy.header.insuredCountries[1],
		function(val) { errors.push("invalid policy.country2 value: " + data.policy.header.insuredCountries[1] ); } );
	cover.push({
		productLine: { typeId: "40070647" },  
        selectedCoverOption: { key: vCountry2 }
        });
	}

// Страна3
	if ( data.policy.header.insuredCountries.length > 2) {
	var vCountry3 = decodeArray1( t_country, data.policy.header.insuredCountries[2],
		function(val) { errors.push("invalid policy.country2 value: " + data.policy.header.insuredCountries[2] ); } );
	cover.push({
		productLine: { typeId: "40070648" },  
        selectedCoverOption: { key: vCountry3 }
        });
	}

// страховая сумма		
	cover.push({
		enteredInsuranceAmount: "30000",
        productLine : { typeId: "40070663" },
        selectedCoverOption: { key: "oid:1" }
		});

// Количестов покрытых дней               -->
	cover.push({            
        productLine: { typeId: "40070656" },
        selectedCoverOption: { key: "oid:" + data.policy.header.insuredDays }
		});

	var disc = 
	{ policy: {
        attnQuestionId: data.policy.header.attn,
        contact: {
			firstName:  data.policy.ph.firstName,
			secondName: data.policy.ph.lastName,
			middleName: data.policy.ph.middleName,
			gender:     vSex,
			birthDate:  data.policy.ph.birthDate,
			latinFirstName:"Test",
			latinTransName:"Testov",
			policyHolder:"true"
		},
		policyStartDate:	"2017-03-02T00:00:00+03:00",
		validUntil:			"2018-03-02T11:45:40+03:00",

		userId: "2210000",
		interfaceVersion: "V_2_16",
		
		delivery:"2015-12-16T11:45:40.115+04:00",
        enteredDeliveryType:"PAID_COURIER_DELIVERY",
        includeDebugInfo:"false",
		
        paymentMethod:"40000000",        
        
        packagesForCalc: 	data.policy.header.package,
        status:"15",
            
        travel: {
			travelMember: {
				firstName:"test",
				secondName:"test",
				middleName:"test",
				gender:"2",
				birthDate:"1987-10-08T00:00:00",
				latinFirstName:"Test",
				latinTransName:"Testov",
				policyHolder:"true"
			}        
		},
	covers: { cover }
    }};
	
	data.error = errors; //"no errors";
	
	if ( errors.length > 0 ) { res.send(data) }
	else {

		nm = nm + 1;
		console.log('pre:' + nm);
		
	callReleaseWS( disc, 
		function (responce){
			disc2data ( data, responce.return );
			//res.send( responce.return);
			nm = nm - 1;
			console.log('post:' + nm);

			res.send(data);
		},
		function (err){
			nm = nm - 1;
			console.log('post:' + nm);

			res.send(err)
		}
		);
	}
		
});

module.exports = router;
