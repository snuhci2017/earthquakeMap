var recordFilePath = '../../data/earthquake-data.csv';
var records = [];
readRecordsFromFile(recordFilePath);

// record를 주어진 csv 파일에서 읽어서 파싱한다.
function readRecordsFromFile(csvFile) {
    d3.csv(csvFile, function(rawdata) {
        rawdata.forEach(function(record) {
            record['magnitude'] = parseAsMagnitude(record['magnitude']);
            record['occurred date'] = parseAsDate(record['occurred date']);
            record['longitude'] = parseAsSingleCoordinate(record['longitude']);
            record['latitude'] = parseAsSingleCoordinate(record['latitude']);
            records.push(record);
        });
    });
}

// ColorRule은 지진의 규모 범위에 대한 색상을 지정하는 룰이다. 
// default와 rules 항목은 필수이며 default 값은 rule의 범위 밖의 지진 레코드에 대해 부여된다.
// 하나의 룰은 지진의 규모가 다음 범위인 경우에 매치된다 (from <= M < to)
var ColorRule = {
    'default': '#ff9900',
    'rules': [
        { 'from': 0, 'to': 3, 'color': '#3366cc' },
        { 'from': 3, 'to': 4, 'color': '#dc3912' },
    ]
};

// ColorRule은 지진의 규모 범위에 대한 크기를 지정하는 룰이다. 
// default와 rules 항목은 필수이며 default 값은 rule의 범위 밖의 지진 레코드에 대해 부여된다.
// 하나의 룰은 지진의 규모가 다음 범위인 경우에 매치된다 (from <= M < to)
var RadiusRule = {
    'default': 5.5,
    'rules': [
        { 'from': 0, 'to': 3, 'radius': 3.5 },
        { 'from': 3, 'to': 4, 'radius': 4.5 },
    ]
};


function removeExistingChart() {
    var elem = document.getElementById('chart');
    if (elem != null)
        elem.parentNode.removeChild(elem);

    d3.select('#mean-magnitude').text('');
    d3.select('#num-occurrences').text('');
    return false;
}

function parseAsDate(str) {
    var substr = str.split(' ');
    var ymd = substr[0].split('-');
    var time = substr[1].split(':');
    var date = {};
    date['year'] = parseInt(ymd[0]);
    date['month'] = parseInt(ymd[1]);
    date['day'] = parseInt(ymd[2]);
    date['hour'] = parseInt(time[0]);
    date['minute'] = parseInt(time[1]);
    return date;
}

function parseAsSingleCoordinate(str) {
    var parsed = str.split(' ');
    var coord = {};
    coord['value'] = parseFloat(parsed[0]);
    coord['direction'] = parsed[1];
    return coord;
}

function parseAsMagnitude(str) {
    return parseFloat(str);
}