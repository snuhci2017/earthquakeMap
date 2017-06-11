// document 가 준비되면 update function 을 부른다
$(document).ready(function() {
    var crt_from_year = 2000;
    var crt_to_year = 2005;
    var crt_from_magnitude = 1;
    var crt_to_magnitude = 7;

    var records = readRecordsFromFile(earthquake_data);
    var filtered = filterRecords(records, crt_from_year, crt_to_year,
        crt_from_magnitude, crt_to_magnitude);

    console.log(filtered);
    setupEpicenterMap(ColorRule, RadiusRule);
    setupBarChart();
    updateEpicenterMap(filtered);
    updateBarChart(filtered, crt_from_year, crt_to_year);

    // slider 가 변경 될시 update function 을 부른다
    d3.select('#year-slider').call(
        d3.slider()
            .axis(true).min(1978).max(2017).step(1)
            .value([crt_from_year, crt_to_year])
            .on("slide", function(evt, value) {
                // 현재 년도를 저장해 놓는다
                crt_from_year = value[0];
                crt_to_year = value[1];
                update(records, crt_from_year, crt_to_year, crt_from_magnitude, crt_to_magnitude);
            }));

    d3.select('#magnitude-slider').call(
        d3.slider()
            .axis(true).min(1).max(7)
            .value([crt_from_magnitude, crt_to_magnitude])
            .on("slide", function(evt, value) {
                // 현재 규모를 저장해 놓는다
                crt_from_magnitude = value[0];
                crt_to_magnitude = value[1];
                update(records, crt_from_year, crt_to_year, crt_from_magnitude, crt_to_magnitude);
            }));
});

/**
 * data 를 filtering 해서 원하는 지진만 표시한다
 * @param records 전체 지진 records
 * @param from_year 시작 년도
 * @param to_year 끝 년도
 * @param from_magnitude 시작 규모
 * @param to_magnitude 끝 규모
 */
function update(records, from_year, to_year, from_magnitude, to_magnitude) {
    var filtered = filterRecords(records, from_year, to_year, from_magnitude, to_magnitude);
    updateEpicenterMap(filtered);
    updateBarChart(filtered, from_year, to_year);
}