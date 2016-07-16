var getTextItems = function (object) {

    var out = [];

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
                    }
                }
            }
        }
    }

    return out
};


function correctUrlChars(string) {
    const regex = '%([0-9]|[A-F])([0-9]|[A-F])';
    function inner(string, index) {
        var newStr;
        newStr = string.substring(0, index) + decodeURIComponent(string.substring(index, index + 3)) + string.substring(index + 3, string.length);

        index = string.search(regex);
        if(index > -1)
            return correctUrlChars(newStr, index);
        else
            return newStr;
    }

    const index = string.search(regex);
    if(index > -1)
        return inner(string, index);
    else
        return string;
}


module.exports ={
    getTextItems: getTextItems,
    correctUrlChars: correctUrlChars
};