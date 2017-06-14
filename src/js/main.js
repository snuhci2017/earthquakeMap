// document 가 준비되면 update function 을 부른다
$(document).ready(function() {
    var crtFromYear = 2000;
    var crtToYear = 2005;
    var crtFromMagnitude = 1;
    var crtToMagnitude = 6;

    var records = readRecordsFromFile(earthquakeData);
    var filtered = filterRecords(records, crtFromYear, crtToYear,
        crtFromMagnitude, crtToMagnitude);

    var bcConfig = setupBcConfig();

    console.log(filtered);
    setupEpicenterMap(bcConfig, determineColor, determineRadius);
    setupBarChart(bcConfig);
    updateEpicenterMap(filtered);
    updateBarChart(bcConfig, filtered);

    // slider 가 변경 될시 update function 을 부른다
    d3.select('#year-slider').call(
        d3.slider()
        .axis(true).min(1978).max(2017).step(1)
        .value([crtFromYear, crtToYear])
        .on("slide", function(evt, value) {
            // 현재 년도를 저장해 놓는다
            crtFromYear = value[0];
            crtToYear = value[1];
            updateTotal(bcConfig, records, crtFromYear, crtToYear,
                crtFromMagnitude, crtToMagnitude);
        }));

    d3.select('#magnitude-slider').call(
        d3.slider()
        .axis(true).min(1).max(6)
        .value([crtFromMagnitude, crtToMagnitude])
        .on("slide", function(evt, value) {
            // 현재 규모를 저장해 놓는다
            crtFromMagnitude = value[0];
            crtToMagnitude = value[1];
            updateTotal(bcConfig, records, crtFromYear, crtToYear,
                crtFromMagnitude, crtToMagnitude);
        }));
});

/**
 * data 를 filtering 해서 원하는 지진만 표시한다
 * @param records 전체 지진 records
 * @param fromYear 시작 년도
 * @param toYear 끝 년도
 * @param fromMagnitude 시작 규모
 * @param toMagnitude 끝 규모
 */
function updateTotal(bcConfig, records, fromYear, toYear, fromMagnitude, toMagnitude) {
    var filtered = filterRecords(records, fromYear, toYear, fromMagnitude, toMagnitude);
    updateEpicenterMap(filtered);
    updateBarChart(bcConfig, filtered);
}