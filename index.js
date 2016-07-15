/**
 * Created by oskari on 27.4.2016.
 */




(function() {

    var parser = {}


    var getTextItems = function (object) {

        var out = []

        if(object instanceof Array) {
            for(var i in object) {
                out = out.concat(getTextItems(i))
            }
        }

        if (typeof object == "object") {
            for (var property in object) {
                if (object.hasOwnProperty(property)) {
                    if (typeof object[property] == "object") {
                        out = out.concat(getTextItems(object[property]));
                    } else if (object[property]) {
                        if (property == "T" && !object[property].match('^[0-9]+$')) {
                            out.push(object[property]);
                            console.log(object);
                        }
                    }
                }
            }
        }

        return out
    }


    exports.parseFromUrl = parser.parseFromUrl = function (url) {

        var http = require('https');
        var fs = require('fs');
        var PDFParser = require('pdf2json')

        var pdfParser = new PDFParser()
        var pdfFile = 'enk2016.pdf'
        var textFile = 'text.txt'

        var textData
        var json

        pdfParser.on("pdfParser_dataReady", pdfData => {
            json = JSON.parse(decodeURI(JSON.stringify(pdfData)))
            textData = getTextItems(json.formImage.Pages)
            console.log(textData)
            console.log(textData.join())
            //const outJson = processKirjallinen(textData);
            fs.writeFile("./" + textFile, JSON.stringify(textData));
            fs.writeFile("./" + 'puretext.txt', textData.join('\n'));
        });

        pdfParser.loadPDF(pdfFile)


        /*var request = http.get(url, function (response) {
            console.log(response)
            fs.writeFile(pdfFile, response, function (err) {
                if(err)
                    console.log('Error writing temp pdf')
                else {
                    pdfParser.loadPDF(pdfFile)
                }
            })
            
        })*/
    }

    if (!module.parent) {
        parser.parseFromUrl(process.argv[2])
    }

})();