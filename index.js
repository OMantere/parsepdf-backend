/**
 * Created by oskari on 27.4.2016.
 */

(function() {

    var fs = require('fs');
    var PDFParser = require('pdf2json');
    var pdfParser = new PDFParser();

    const parseHelpers = require('./lib/parse-helpers');


    function parse(pdfFile) {

        //For testing
        pdfFile = 'enk2016.pdf';

        var urlDecodedFile = 'urldecoded.txt';
        var textData;
        var json;

        pdfParser.on("pdfParser_dataReady", pdfData => {
            json = JSON.parse(decodeURI(JSON.stringify(pdfData)));
            textData = parseHelpers.getTextItems(json.formImage.Pages);
            fs.writeFile("./" + urlDecodedFile, textData.map(str => parseHelpers.correctUrlChars(str)).join('\n'));
        });

        pdfParser.loadPDF(pdfFile)
    }

    module.exports = parse;

    if (!module.parent) {
        parse(process.argv[2])
    }

})();