/**
 * Created by oskari on 27.4.2016.
 */

(function() {

    var fs = require('fs');
    var PDFParser = require('pdf2json');
    var pdfParser = new PDFParser();

    const parseHelpers = require('./lib/parse-helpers');
    const enLongParser = require('./lib/parsers/english-long');


    function parse(file) {

        //For testing
        file = 'enk2014';

        var urlDecodedFile = 'urldecoded.txt';
        var textData;
        var json;

        pdfParser.on("pdfParser_dataReady", pdfData => {
            json = JSON.parse(decodeURI(JSON.stringify(pdfData)));
            textData = parseHelpers.getTextItems(json.formImage.Pages);

            fs.writeFile("./" + urlDecodedFile, textData.join('\n'));
            fs.writeFile("./" + file + '.json', enLongParser(textData));
        });

        pdfParser.loadPDF(file + '.pdf')
    }

    module.exports = parse;

    if (!module.parent) {
        parse(process.argv[2])
    }

})();