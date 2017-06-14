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
        if (!isNaN(new_record.longitude.value) && isInValidRange(new_record.longitude, new_record.latitude))
            records.push(new_record);
    });

    return records;
}

// Scatter Plot에 출력 가능한 위치의 범위
var validGeoRange = {};
validGeoRange['longitude'] = { left: 122, right: 131 };
validGeoRange['latitude'] = { top: 43, bottom: 32.8 };

// ColorRule 은 지진의 규모 범위에 대한 색상을 지정하는 룰이다.
// default 와 rules 항목은 필수이며 default 값은 rule 의 범위 밖의 지진 레코드에 대해 부여된다.
// 하나의 룰은 지진의 규모가 다음 범위인 경우에 매치된다 (from <= M < to)
var ColorRule = {
    'default': '#FF4747',
    'rules': [
        { 'from': 0, 'to': 3, 'color': '#FF4747' },
        { 'from': 3, 'to': 4, 'color': '#FF4747' },
        { 'from': 4, 'to': 5, 'color': '#FF4747' },
    ]
};

// ColorRule 은 지진의 규모 범위에 대한 크기를 지정하는 룰이다.
// default 와 rules 항목은 필수이며 default 값은 rule 의 범위 밖의 지진 레코드에 대해 부여된다.
// 하나의 룰은 지진의 규모가 다음 범위인 경우에 매치된다 (from <= M < to)
var RadiusRule = {
    'default': 9.5,
    'rules': [
        { 'from': 0, 'to': 3, 'radius': 3.5 },
        { 'from': 3, 'to': 4, 'radius': 5.5 },
        { 'from': 4, 'to': 5, 'radius': 7.5 },
    ]
};

function isInValidRange(longitude, latitude) {
    return ((validGeoRange.longitude.left <= longitude.value && longitude.value <= validGeoRange.longitude.right) &&
        (validGeoRange.latitude.bottom <= latitude.value && latitude.value <= validGeoRange.latitude.top));
}

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

function determineColor(magnitude) {
    return '#ff4747';
}

function determineRadius(magnitude) {
    return (magnitude * 2.0);
}

/*
// magnitude에 따라 점의 색깔을 결정한다.
function determineColor(magnitude) {
    var color = ColorRule.default;

    for (i = 0; i < ColorRule.rules.length; i++) {
        var rule = ColorRule.rules[i];
        if (rule.from <= magnitude && magnitude < rule.to) {
            color = rule.color;
        }
    }

    return color;
}

// magnitude에 따라 점의 크기를 결정한다.
function determineRadius(magnitude) {
    var radius = RadiusRule.default;

    for (i = 0; i < RadiusRule.rules.length; i++) {
        var rule = RadiusRule.rules[i];
        if (rule.from <= magnitude && magnitude < rule.to) {
            radius = rule.radius;
        }
    }

    return radius;
}
*/

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