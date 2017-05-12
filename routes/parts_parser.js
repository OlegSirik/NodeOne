var request = require('request');
var cheerio = require('cheerio');
var needle = require('needle');


exports.getPlRenault = getPlRenault;
exports.getPlMajorAuto = getPlMajorAuto;

exports.getPlRolf  = getPlRolf;
exports.getPlVW    = getPlVW;
exports.getPlSkoda = getPlSkoda;
exports.getPlKia   = getPlKia;
exports.getPlMBenz = getPlMBenz;

function getPlRenault(partNr, results, theEnd) {

	needle.post( 'http://parts.renault.ru/xls/showbycode/', 'code=' + partNr, function (err, res2){

    if (err) throw err;
      
    var $ = cheerio.load(res2.body);

		$('table[class=price]').children().eq(1).children().each(function(i, elem) {  // tbody
			var data = $(this);

			results.push({
				newline: {
					part_nr      : data.find('td[class=number]').text(),
					part_name    : data.find('td[class=title]').text(),
					part_amt     : data.find('td[class=sht]').text(),
					part_price   : data.find('td[class=pricedlr]').text(),
					update_date  : data.children().contents().eq(4).text(),
				
					dealer_name  : data.find('td[class=dealer]').children().eq(0).text(),
					dealer_town  : data.find('td[class=town]').text(),
					dealer_adr   : data.find('td[class=address]').text(),
					dealer_phones: data.find('td[class=phone]').children().eq(0).text()
				}
			});
		});
	theEnd(results);	
	});
}

function getPlMajorAuto(partNr, results, theEnd) {

	needle.get( 'http://parts.major-auto.ru/Search?value=' + partNr, function (err, res2){

        if (err) throw err;
        
        var $ = cheerio.load(res2.body);
		var row_num = 0;
		
		$('table[class=tableContent]').children().each(function(i, elem) {  // tbody
			var data = $(this);
			row_num = row_num + 1;
			if (row_num > 2){
            results.push({
				newline: {
				part_nr  : data.children().contents().eq(0).text(),
				part_name    : data.contents().eq(3).contents().eq(1).contents().eq(1).contents().eq(1).contents().eq(0).text().replace(/[\n\t\r ]/g,""),
				part_amt     : data.children().contents().eq(5).text(),
				part_price   : data.children().contents().eq(4).text(),
				dealer_name  : '',
				dealer_town  : '',
				dealer_adr   : '',
				dealer_phones: ''
				}
            });
			}
		});
			
	theEnd(results);
	});	
}


//app.get('/data/auto/rolf/:id', function(req1, res1){
function getPlRolf(partNr, results, theEnd) {

	needle.get( 'http://parts.rolf.ru/?pcode=' + partNr, function (err, res2){

        if (err) throw err;
        
        var $ = cheerio.load(res2.body);

		$('table[class=globalResult]').children().eq(1).children().each(function(i, elem) {  // tbody
			var data = $(this);

			if ( data.children().length > 1 ) {
            results.push({
				newline: {
				part_nr    : data.contents().eq(5).text().replace(/[\n\t\r]/g,""),
				part_name   : data.contents().eq(7).text().replace(/[\n\t\r]/g,""),
				part_amt       : data.contents().eq(9).text().replace(/[\n\t\r]/g,""),
				part_price       : data.contents().eq(15).text().replace(/[\n\t\r ]/g,""),
				
				dealer_name  : data.contents().eq(11).text().replace(/[\n\t\r]/g,""),
				dealer_town  : '',
				dealer_adr   : '',
				dealer_phones: ''
				}
            });
			}
		});
	theEnd(results);
	});	
}

//app.get('/data/auto/vw/:id', function(req1, res1){
function getPlVW(partNr, results, theEnd) {

	needle.get( 'http://www.vw.parts-shop.vwgroup.ru/search?article=' + partNr + '&region=&dealer=', function (err, res2){

        if (err) throw err;
   
        var $ = cheerio.load(res2.body);

		var part_nr = $('div.search-result > div.header > span.article').text();  // tbody
		var part_name = $('div.search-result > div.header > span.title').text();  // tbody
		
		$('div.search-result > div.result > table > tbody.content > tr').each(function(i, elem) {  
			var data = $(this);

            results.push({
				newline: {
				part_nr    : part_nr,
				part_name  : part_name,
				part_amt   : data.find('td.dealer-presence > span.presence').text(),
				part_price : data.find('td.dealer-price > span.price').text().replace(/[\n\t\r ]/g,""),

				dealer_name  : data.find('td.dealer-name > span').text(),
				dealer_town  : '',
				dealer_adr   : '',
				dealer_phones: ''
				}
            });
			
		});
		
	theEnd(results);
	});	
}

//app.get('/data/auto/skoda/:id', function(req1, res1){
function getPlSkoda(partNr, results, theEnd) {

	needle.get( 'http://www.parts.skoda-avto.ru/search?article=' + partNr + '&region=&dealer=', function (err, res2){

        if (err) throw err;

        var $ = cheerio.load(res2.body);
		

		var part_nr = $('div.search-result > div.header > span.article').text();  // tbody
		var part_name = $('div.search-result > div.header > span.title').text();  // tbody
		
		$('div.search-result > div.result > table > tbody.content > tr').each(function(i, elem) {  
			var data = $(this);

            results.push({
				newline: {
				part_nr    : part_nr,
				part_name  : part_name,
				part_amt   : data.find('td.dealer-presence > span.presence').text(),
				part_price : data.find('td.dealer-price > span.price').text().replace(/[\n\t\r ]/g,""),

				dealer_name  : data.find('td.dealer-name > span').text(),
				dealer_town  : '',
				dealer_adr   : '',
				dealer_phones: ''
				}
            });
			
		});
	theEnd(results);
	});	
}

//app.get('/data/auto/kia/:id', function(req1, res1){
function getPlKia(partNr, results, theEnd) {

	needle.get( 'https://www.kia.ru/service/spares/?PROPERTIES%5BCITY%5D=&set_filter=&part_code=' + partNr , function (err, res2){

        if (err) throw err;

        var $ = cheerio.load(res2.body);
		
		var part_nr    = $('div.spares-find > table > tbody > tr.tr_even').children().eq(0).text().replace(/[\n\t\r]/g,"");  // tbody
		var part_name  = $('div.spares-find > table > tbody > tr.tr_even').children().eq(1).text().replace(/[\n\t\r]/g,"");
		var part_price = $('div.spares-find > table > tbody > tr.tr_even').children().eq(2).text().replace(/[\n\t\r ]/g,"");

        results.push({
			newline: {
				part_nr    : part_nr,
				part_name  : part_name,
				part_amt   : '',
				part_price : part_price,

				dealer_name  : 'RRC',
				dealer_town  : '',
				dealer_adr   : '',
				dealer_phones: ''
			}
        });
	theEnd(results);
	});	
}

//app.get('/data/auto/mbenz/:id', function(req1, res1){
function getPlMBenz(partNr, results, theEnd) {

	needle.get( 'http://partsprice.mercedes-benz.ru/Parts/SearchPanel?articles=' + partNr , function (err, res2){

        if (err) throw err;

        var $ = cheerio.load(res2.body);

		var part_nr    = $('div.searchResultTable > table > tbody > tr').children().eq(0).text().replace(/[\n\t\r]/g,"");  // tbody
		var part_name  = $('div.searchResultTable > table > tbody > tr').children().eq(1).text().replace(/[\n\t\r]/g,"");
		var part_price = $('div.searchResultTable > table > tbody > tr').children().eq(2).text().replace(/[\n\t\r ]/g,"");
		
        results.push({
			newline: {
				part_nr    : part_nr,
				part_name  : part_name,
				part_amt   : '',
				part_price : part_price,

				dealer_name  : 'RRC',
				dealer_town  : '',
				dealer_adr   : '',
				dealer_phones: ''
			}
        });
	theEnd(results);
	});	
}

