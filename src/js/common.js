// record 를 주어진 파일에서 읽어서 파싱한다.
function readRecordsFromFile(data) {
    var records = [];
    var id = 0;

    data.forEach(function(record) {
        var new_record = {};
        new_record['magnitude'] = parseAsMagnitude(record['magnitude']);
        new_record['occurred_date'] = parseAsDate(record['occurred_date']);
        new_record['longitude'] = parseAsSingleCoordinate(record['longitude']);
        new_record['latitude'] = parseAsSingleCoordinate(record['latitude']);
        var location = record['location'].split(" ");

        if (location[0] === '북한')
            new_record['location'] = location[1];
        else
            new_record['location'] = location[0];

        new_record['id'] = id++;
        if (!isNaN(new_record.longitude.value))
            records.push(new_record);
    });

    return records;
}

// ColorRule 은 지진의 규모 범위에 대한 색상을 지정하는 룰이다.
// default 와 rules 항목은 필수이며 default 값은 rule 의 범위 밖의 지진 레코드에 대해 부여된다.
// 하나의 룰은 지진의 규모가 다음 범위인 경우에 매치된다 (from <= M < to)
var ColorRule = {
    'default': '#ff0000',
    'rules': [
        { 'from': 0, 'to': 3, 'color': '#00cc00' },
        { 'from': 3, 'to': 4, 'color': '#3333ff' },
        { 'from': 4, 'to': 5, 'color': '#ff8000' },
    ]
};

// ColorRule 은 지진의 규모 범위에 대한 크기를 지정하는 룰이다.
// default 와 rules 항목은 필수이며 default 값은 rule 의 범위 밖의 지진 레코드에 대해 부여된다.
// 하나의 룰은 지진의 규모가 다음 범위인 경우에 매치된다 (from <= M < to)
var RadiusRule = {
    'default': 6.5,
    'rules': [
        { 'from': 0, 'to': 3, 'radius': 3.5 },
        { 'from': 3, 'to': 4, 'radius': 4.5 },
        { 'from': 4, 'to': 5, 'radius': 5.5 },
    ]
};


function removeExistingChart(chartId) {
    var elem = document.getElementById(chartId);
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

// Jittering을 위한 random number 생성 함수
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

var jitterMax = 0.05,
    jitterMin = -0.05;

function parseAsSingleCoordinate(str) {
    var parsed = str.split(' ');
    var coord = {};
    coord['value'] = parseFloat(parsed[0]) + getRandom(jitterMin, jitterMax);
    coord['direction'] = parsed[1];
    return coord;
}

function parseAsMagnitude(str) {
    return parseFloat(str);
}

function translate(x, y) {
    return 'translate(' + x + ', ' + y + ')';
}

// 주어진 범위에 맞게 filtering 한다
function filterRecords(records, fromYear, toYear, minMagnitude, maxMagnitude) {
    return records.filter((rec) => (fromYear <= rec.occurred_date.year) && (rec.occurred_date.year <= toYear))
        .filter((rec) => (minMagnitude <= rec.magnitude && rec.magnitude <= maxMagnitude));
}