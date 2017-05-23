var recordFilePath = '../../data/earthquake-data.csv';
var records = [];
readRecordsFromFile(recordFilePath);

function readRecordsFromFile(file) {
    d3.csv(file, function(rawdata) {
        rawdata.forEach(function(record) {
            record['scale'] = parseAsScale(record['scale']);
            record['occurred date'] = parseAsDate(record['occurred date']);
            record['longitude'] = parseAsSingleCoordinate(record['longitude']);
            record['latitude'] = parseAsSingleCoordinate(record['latitude']);
            records.push(record);
        });
    });
}

function removeExistingChart() {
    var elem = document.getElementById('chart');
    if (elem != null)
        elem.parentNode.removeChild(elem);

    d3.select('#mean-intensity').text('');
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

function parseAsScale(str) {
    return parseFloat(str);
}