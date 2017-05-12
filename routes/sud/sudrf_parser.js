var request = require('request');
var cheerio = require('cheerio');
var needle = require('needle');
const URL = require('url').URL;

//exports.parseSudrfv1 = parseSudrfv1;
//exports.parseSudrfMirv1 = parseSudrfMirv1;

exports.getSudRfByRegion = getSudRfByRegion;
exports.getSudRfMirByRegion = getSudRfMirByRegion;
exports.getMosMirByNr = getMosMirByNr;
exports.getArbitrByNr = getArbitrByNr;
exports.getMosGorByNr = getMosGorByNr;
exports.getMosGorByUID = getMosGorByUID;
exports.getMosGorByPage = getMosGorByPage;

function getSudURL(pRegiodId) {
	if (pRegiodId < 10) {
		return 'https://sudrf.ru/index.php?id=300&act=go_search&searchtype=fs&court_name=&court_subj=0' + pRegiodId + '&fs_city=&fs_street=&court_type=0&court_okrug=0&vcourt_okrug=0';
	} else {
		return 'https://sudrf.ru/index.php?id=300&act=go_search&searchtype=fs&court_name=&court_subj=' + pRegiodId + '&fs_city=&fs_street=&court_type=0&court_okrug=0&vcourt_okrug=0';
	}
}

function getSudMirURL(pRegiodId) {
	if (pRegiodId < 10) {
		return 'https://sudrf.ru/index.php?id=300&act=go_ms_search&searchtype=ms&var=true&ms_type=ms&court_subj=0' + pRegiodId + '&ms_city=&ms_street=';
	} else {
		return 'https://sudrf.ru/index.php?id=300&act=go_ms_search&searchtype=ms&var=true&ms_type=ms&court_subj=' + pRegiodId + '&ms_city=&ms_street=';
	}
}

function getSudRfByRegion(regionNr, results, theEnd) {

	needle.get(getSudURL(regionNr), function (err, res2){
	try {        
		var $ = cheerio.load(res2.body);

		$('ul[class=search-results]').children().each(function(i, elem) {
			var data = $(this);

			results.push({
				newline: {
					sud_name: data.children().contents().eq(0).text(),
					sud_okrug: data.children().contents().eq(1).text(),
					sud_city: data.children().contents().eq(3).text(),
					sud_code: data.children().contents().eq(5).text(),
					sud_adr: data.children().contents().eq(8).text(),
					sud_phones: data.children().contents().eq(11).text(),
					sud_mails: data.children().contents().eq(16).text(),
					sud_www: data.children().contents().eq(18).contents().eq(3).text()
				}
			});
		});
	//theEnd(results);
	} catch (err) {}	
	theEnd(results);
	});	

};

function getSudRfMirByRegion(regionNr, results, theEnd) {
     
	needle.get(getSudMirURL(regionNr), function (err, res2){
	try {  
        var $ = cheerio.load(res2.body);

		$('table[class=msSearchResultTbl]').children().each(function(i, elem) {
			var data = $(this);

            results.push({
				newline: {
					sud_name: data.children().contents().eq(0).text(),
					sud_okrug: '',
					sud_city: data.children().contents().eq(2).contents().eq(1).text(),
					sud_code: data.children().contents().eq(2).contents().eq(4).text().replace(/[\n\t\r]/g,""),
					sud_adr: '',
					sud_phones: '',
					sud_mails: '',
					sud_www: data.children().contents().eq(2).contents().eq(5).contents().eq(4).text()
				}
            });
		});
	} catch (err) {}	
	theEnd(results);
	});
}

function getMosMirByNr(sudNr, results, theEnd) {     
	
	needle.get('http://mos-sud.ru/ms/' + sudNr + '/', function (err, res2){
	console.log('http://mos-sud.ru/ms/' + sudNr );
	try {  
        var $ = cheerio.load(res2.body); 

		var pHeader = $('p[class=header]').text();
		//console.log( pHeader );
		var table = $('table[id=detail]').children().eq(2).children().eq(0).children().eq(0);
		//results.push({newline: {data1}});
		var line1 = table.children().eq(0).children().eq(1).text();
		var line2 = table.children().eq(1).children().eq(1).text();
		
		var line3p = table.children().eq(2).children().eq(0).text();
		var line3 = table.children().eq(2).children().eq(1).text();
		
		
		var line4p = table.children().eq(3).children().eq(0).text();
		var line4 = table.children().eq(3).children().eq(1).text();
		
		var line5 = table.children().eq(4).children().eq(1).text();

		var line6p = table.children().eq(5).children().eq(0).text();
		var line6 = table.children().eq(5).children().eq(1).text();
		
		var line7p = table.children().eq(6).children().eq(0).text();
		var line8p = table.children().eq(7).children().eq(0).text();
		var line7 = table.children().eq(6).children().eq(1).text();
		var line8 = table.children().eq(7).children().eq(1).text();

		var line9 = table.children().eq(8).children().eq(1).text();
		var line10 = table.children().eq(9).children().eq(1).text();
		
/*			
		console.log( line1 );
		console.log( line2 );
		console.log( line3 );
		console.log( line4 );
		console.log( line5 );
		console.log( line6 );
		console.log( line7 );
		console.log( line8 );
		console.log( line9 );
		console.log( line10 );
*/

		if (line3p.indexOf('дрес')!=-1) {
            results.push({
				newline: {
					sud_name: pHeader,
					sud_okrug: '',
					sud_city: '',
					sud_code: '',
					sud_adr: line3,
					sud_phones: line6p + ' ' + line6 + ' ' + line7p + ' ' + line7,
					sud_mails: line4,
					sud_www: '',
					sud_text: table.children().eq(7).children().eq(0).text() + ' ' +
						table.children().eq(7).children().eq(1).text() + '; \n' +
						table.children().eq(8).children().eq(0).text() + ' ' +
						table.children().eq(8).children().eq(1).text() + '; \n' +
						table.children().eq(9).children().eq(0).text() + ' ' +
						table.children().eq(9).children().eq(1).text() + '; \n' +
						table.children().eq(10).children().eq(0).text() + ' ' +
						table.children().eq(10).children().eq(1).text() + '; '

				}
            });
		} else {
            results.push({
				newline: {
					sud_name: pHeader,
					sud_okrug: '',
					sud_city: '',
					sud_code: '',
					sud_adr: line4,
					sud_phones: line7p + ' ' + line7 + ' ' + line8p + ' ' + line8,
					sud_mails: line5,
					sud_www: '',
					sud_text: table.children().eq(8).children().eq(0).text() + ' ' +
						table.children().eq(8).children().eq(1).text() + '; \n' +
						table.children().eq(9).children().eq(0).text() + ' ' +
						table.children().eq(9).children().eq(1).text() + '; \n' +
						table.children().eq(10).children().eq(0).text() + ' ' +
						table.children().eq(10).children().eq(1).text() + '; \n' +
						table.children().eq(11).children().eq(0).text() + ' ' +
						table.children().eq(11).children().eq(1).text() + '; '
				}
			});
		}

	} catch (err) {}	
	theEnd(results);
	});
}

function valByName(pArray, pVal) {

	for (var i = 0; i < pArray.length; i++){
        if (pArray[i].name.toLowerCase().indexOf(pVal.toLowerCase()) >= 0){
			return pArray[i].val; 
		}
	}

	return "";
}

function getArbitrByNr(sudNr, results, theEnd) {
    
	var vData =[];
	
	needle.get('http://www.arbitr.ru/as/subj/?id_ac=' + sudNr, function (err, res2){
	//console.log('http://mos-sud.ru/ms/' + sudNr );
	try {  
        var $ = cheerio.load(res2.body); 

		var pHeader = $('h1[class=as_header]').text();
		console.log( pHeader );
		
		var pTable= $('h1[class=as_header]').parent().children().eq(4).children().eq(0).children().eq(2);        
		var pRows = pTable.children().eq(0).children();
		console.log(pRows.length);
		
		vData.push({name: pRows.eq(1).children().eq(0).text(), val: pRows.eq(1).children().eq(1).text()});
		vData.push({name: pRows.eq(2).children().eq(0).text(), val: pRows.eq(2).children().eq(1).text()});
		vData.push({name: pRows.eq(3).children().eq(0).text(), val: pRows.eq(3).children().eq(1).text()});
		vData.push({name: pRows.eq(4).children().eq(0).text(), val: pRows.eq(4).children().eq(1).text()});
		vData.push({name: pRows.eq(5).children().eq(0).text(), val: pRows.eq(5).children().eq(1).text()});
		vData.push({name: pRows.eq(6).children().eq(0).text(), val: pRows.eq(6).children().eq(1).text()});
		vData.push({name: pRows.eq(7).children().eq(0).text(), val: pRows.eq(7).children().eq(1).text()});
		vData.push({name: pRows.eq(8).children().eq(0).text(), val: pRows.eq(8).children().eq(1).text()});
			
		//console.log( vData );
		//console.log("VAL=");
		//var v = valByName( vData, 'адрес');
		//console.log(v);
		
        results.push({
				newline: {
					sud_name: pHeader,
					sud_okrug: '',
					sud_city:  '',
					sud_code:  valByName( vData, 'код'),
					sud_adr:   valByName( vData, 'адрес'),
					sud_phones: valByName( vData, 'телефон'),
					sud_mails: valByName( vData, 'mail'),
					sud_www: valByName( vData, 'сайт'),
					sud_text: ''

				}
            });

	} catch (err) {}	
	theEnd(results);
	});
}

function getMosGorByUID(caseUID, results, theEnd) {
    
	var vData =[];
	//var myURL = new URL('http://mos-gorsud.ru' + caseUID);
	var myURL = new URL(caseUID);
	//myURL.search = 'caseNumber=' + caseNr;
	
console.log("URL2=" + myURL.toString());
		
	needle.get( myURL.toString(), function (err, res3){
	try {  
        var $ = cheerio.load(res3.body); 
//console.log('URL2.body=' + $.html());
		
		var pHeader1 = $('main [class=content]');
		var pHeader2 = $('div [class=mainblock_title]');
		
		var pTable= $('div [id=content]');   
		
		var pTable1 = pTable.find('div [class=cardsud_wrapper]').children();
		var pRow02 = pTable1.eq(0).find('div [class=right]').text();
		var pRow12 = pTable1.eq(1).find('div [class=right]').text();
		var pRow22 = pTable1.eq(2).find('div [class=right]').text();
		var pRow32 = pTable1.eq(3).find('div [class=right]').text();
		var pRow42 = pTable1.eq(4).find('div [class=right]').text();
		var pRow52 = pTable1.eq(5).find('div [class=right]').text();
		//var pRow = pTable.children().eq(1).children().eq(0).children();
/*				
        results.push({
				newline: {
					sud_caseNr:  pRow02.trim(),
					sud_caseDt:  pRow12.trim(),
					sur_caseRef: '',
					sud_sides:   pRow22.trim(),
					sud_status:  '',
					sud_court:   pRow32.trim(),
					sud_stNr:    '',
					sud_category:pRow42.trim(),
					sud_mails:   '',
					sud_www:     '',
					sud_text: pRow52.trim()
				}
            });
*/
		var pTable2 = pTable.find('div [id=tabs-1]').find('tbody').children();
		
		for ( iCnt = 0; iCnt < pTable2.length; iCnt++) {

			results.push({
				newline: {
					tblnum: "1",
					rownum: iCnt,
					col1: pTable2.eq(iCnt).children().eq(0).text().trim(),
					col2: pTable2.eq(iCnt).children().eq(1).text().trim(),
					col3: pTable2.eq(iCnt).children().eq(2).text().trim()
				}
			});	
		}

		var pTable3 = pTable.find('div [id=tabs-2]').find('tbody').children();
		for ( iCnt = 0; iCnt < pTable3.length; iCnt++) {

			results.push({
				newline: {
					tblnum: "2",
					rownum: iCnt,
					col1: pTable3.eq(iCnt).children().eq(0).text().trim(),
					col2: pTable3.eq(iCnt).children().eq(1).text().trim(),
					col3: pTable3.eq(iCnt).children().eq(2).text().trim(),
					col4: pTable3.eq(iCnt).children().eq(3).text().trim(),
					col5: pTable3.eq(iCnt).children().eq(4).text().trim(),
					col6: pTable3.eq(iCnt).children().eq(5).text().trim(),
					col7: pTable3.eq(iCnt).children().eq(6).text().trim()
					}
			});	
		}
		
		var pTable4 = pTable.find('div [id=tabs-3]').find('tbody').children();
		for ( iCnt = 0; iCnt < pTable4.length; iCnt++) {

			results.push({
				newline: {
					tblnum: "3",
					rownum: iCnt,
					col1: pTable4.eq(iCnt).children().eq(0).text().trim(),
					col2: pTable4.eq(iCnt).children().eq(1).text().trim(),
					col3: pTable4.eq(iCnt).children().eq(2).text().trim()
					}
			});	
		}
		
	} catch (err) { console.log( err );}	
	theEnd(results);
	});
}

function getMosGorByNr(caseNr, results, theEnd) {
    
	var vData =[];
	var myURL = new URL('http://mos-gorsud.ru/search?participant=интач&caseNumber='+ caseNr);
	var pURL = '';
	//myURL.search = 'caseNumber=' ;
	
	console.log("URL=" + myURL.toString());
		
	needle.get( myURL.toString(), function (err, res2){
	try {  
        var $ = cheerio.load(res2.body); 

		var pTable= $('table[class=custom_table]');        
		var pRow = pTable.children().eq(1).children().eq(0).children();
		pURL = pRow.eq(0).find('a').attr('href');
		
        results.push({
				newline: {
					sud_caseNr:  pRow.eq(0).find('a').text().trim(),
					sur_caseURL:'http://mos-gorsud.ru' + pRow.eq(0).find('a').attr('href'),
					sud_sides:   pRow.eq(1).text().trim().replace(/\s\s+/g, ''),
					sud_status:  pRow.eq(2).text().trim(),
					sud_court:   pRow.eq(3).text().trim(),
					sud_stNr:    pRow.eq(4).text().trim(),
					sud_category:pRow.eq(5).text().trim()
				}
            });
					
		
	} catch (err) {}	
	//getMosGorByUID( pURL, results, theEnd) ;
	theEnd(results);
	});
}

function getMosGorByPage(pageNr, results, theEnd) {
    
	var vData =[];
	var myURL = new URL('http://mos-gorsud.ru/search?participant=интач&page='+ pageNr);
	var pURL = '';
	//myURL.search = 'caseNumber=' ;
		
	needle.get( myURL.toString(), function (err, res2){
	try {  
        var $ = cheerio.load(res2.body); 

		var pTable= $('table[class=custom_table]');        
		
		pTable.children().eq(1).children().each(function(i, elem) {


			var data = $(this).children();


		
			//pURL = data.eq(0).find('a').attr('href');
		
        results.push({
				newline: {
					sud_caseNr:  data.eq(0).find('a').text().trim(),
					sur_caseURL:'http://mos-gorsud.ru' + data.eq(0).find('a').attr('href'),
					sud_sides:   data.eq(1).text().trim().replace(/\s\s+/g, ''),
					sud_status:  data.eq(2).text().trim(),
					sud_court:   data.eq(3).text().trim(),
					sud_stNr:    data.eq(4).text().trim(),
					sud_category:data.eq(5).text().trim()
				}
            });
		});		
		
	} catch (err) {}	
	//getMosGorByUID( pURL, results, theEnd) ;
	theEnd(results);
	});
}

/*
function parseSudrfv1(res2, results) {
        
console.log('data_sudrf.parseSudrfv1');				

        var $ = cheerio.load(res2.body);

		$('ul[class=search-results]').children().each(function(i, elem) {
			var data = $(this);

            results.push({
				sud_name: data.children().contents().eq(0).text(),
				sud_okrug: data.children().contents().eq(1).text(),
				sud_city: data.children().contents().eq(3).text(),
				sud_code: data.children().contents().eq(5).text(),
				sud_adr: data.children().contents().eq(8).text(),
				sud_phones: data.children().contents().eq(11).text(),
				sud_mails: data.children().contents().eq(16).text(),
				sud_www: data.children().contents().eq(18).contents().eq(3).text()
            });
		});
			
};

function parseSudrfMirv1(res2, results) {
        
console.log('data_sudrfMir.parseSudrfv1');				

        var $ = cheerio.load(res2.body);

		$('table[class=msSearchResultTbl]').children().each(function(i, elem) {
			var data = $(this);

            results.push({
				sud_name: data.children().contents().eq(0).text(),
				sud_okrug: '',
				sud_city: data.children().contents().eq(2).contents().eq(1).text(),
				sud_code: data.children().contents().eq(2).contents().eq(4).text().replace(/[\n\t\r]/g,""),
				sud_adr: '',
				sud_phones: '',
				sud_mails: '',
				sud_www: data.children().contents().eq(2).contents().eq(5).contents().eq(4).text()
            });
		});
			
};
*/