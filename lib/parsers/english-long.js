const _ = require('lodash');

function getConsecutiveItemsBeforeStopper(buffer, greedyCheckStop, lazyCheckStop, maxItems) {
    var string = '';
    var count = 0
    for (var i = buffer.index; i < buffer.array.length; i++) {
        const item = buffer.next();
        count++;
        if(greedyCheckStop)
            if(greedyCheckStop(item)) return string;
        string += item;
        if(lazyCheckStop)
            if(lazyCheckStop(item)) return string;
        if(count == maxItems) return string;
    }
}

function getLargeHeading(buffer) {
   return getConsecutiveItemsBeforeStopper(buffer, null, item => item == '.', null)
}

function getQuestionText(buffer) {
    return getConsecutiveItemsBeforeStopper(buffer, item => item == 'A', null)
}

function getQuestionAnswers(buffer, questionNumber) {
    const num = parseInt(questionNumber);
    const nextQuestionNumber = (num+1).toString() + '.';
    const object = {
        A: getConsecutiveItemsBeforeStopper(buffer, item => item.search('^ *B *$') > -1, null, 4),
        B: getConsecutiveItemsBeforeStopper(buffer, item => item.search('^ *C *$') > -1, null, 4),
        C: getConsecutiveItemsBeforeStopper(buffer, item => (item.search('^ *D *$') > -1 || item.indexOf(nextQuestionNumber) > -1), null, 4)
    };
    if(buffer.current().search('^ *D *$') > -1)
        object.D = buffer.next();
    else
        buffer.rewind();

    return object;
}

function getFreeTextQuestion(buffer) {
    return {
        fi: getConsecutiveItemsBeforeStopper(buffer, null, item => item.match('\\\? *$'), 6),
        sv: getConsecutiveItemsBeforeStopper(buffer, null, item => item.match('\\\? *$'), 6)}
}


function toJSON(textArray) {
    const object = {
        "sections": {
            "reading_comprehension": {
                "one": {
                    heading: ''
                },
                "two": {
                    questions: {}
                }
            },
            "grammar_and_vocabulary": {
                "one": {
                    heading: ''
                },
                "two": {}
            }
        },
        "questions": {

        }
    };
    
    const buffer = {
        array: textArray,
        index: 0,
        current: () => buffer.array[buffer.index-1],
        rewind: () => buffer.index--,
        next: () => {
            buffer.index++;
            if(buffer.index == buffer.array.length)
                return null;
            return buffer.array[buffer.index-1];
        }
    };

    var previous = [];
    var item;

    while((item = buffer.next()) != null) {
        if (previous.length > 0) {
            if (item.indexOf('READING COMPREHENSION') > -1) {
                object.sections.reading_comprehension.one.heading = getLargeHeading(buffer);
            }
            else if (item.indexOf('GRAMMAR AND VOCABULARY') > -1) {
                object.sections.grammar_and_vocabulary.one.heading = getLargeHeading(buffer);
            }
            else if (item.search('^1\.1[a-z]$') > -1) {
                const sectionChar = item.charAt(item.search('^1\.1[a-z]$')+3);
                if(!object.sections.reading_comprehension.one[sectionChar])
                    object.sections.reading_comprehension.one[sectionChar] = { title: '', text: '' };
            }
            else if (item.search('^ ?([0-9][0-9])\.$|^ ?([0-9])\.$') > -1) {
                const questionNumber = item.substring(item.search('^ ([0-9][0-9])\.$|^ ([0-9])\.$')+1, item.length).replace('.', '');
                object.questions[questionNumber] = {
                    text: getQuestionText(buffer),
                    answers: getQuestionAnswers(buffer, questionNumber)
                }
            } else if (item.match('^[a-e]\\\)$')) {
                const question = item.charAt(0);
                object.sections.reading_comprehension.two.questions[question] = getFreeTextQuestion(buffer);
            }
        }
        previous.push(item);
    }

    return JSON.stringify(object, null, 2);
}

module.exports = toJSON;