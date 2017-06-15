// document 가 준비되면 update function 을 부른다
$(document).ready(function() {
    var crtFromYear = 2010;
    var crtToYear = 2014;
    var crtFromMagnitude = 1;
    var crtToMagnitude = 6;

    var records = readRecordsFromFile(earthquakeData);
    var filtered = filterRecords(records, crtFromYear, crtToYear,
        crtFromMagnitude, crtToMagnitude);

    var bcConfigs = [];
    bcConfigs.push(setupBcConfig("#yearly-statistics", "년도", { 'width': 1350, 'height': 350 }));
    bcConfigs.push(setupBcConfig("#regional-statistics", "지역", { 'width': 950, 'height': 350 }));

    console.log(filtered);
    setupEpicenterMap(bcConfigs, determineColor, determineRadius);

    bcConfigs[0].change = pieChart("#pie-chart", getMagnitudeOccurStatistics(filtered));
    bcConfigs[1].change = bcConfigs[0].change;

    bcConfigs.forEach((config) => {
        setupBarChart(config);
        updateTotal(config, filtered, crtFromYear, crtToYear,
            crtFromMagnitude, crtToMagnitude);
    });

    // slider 가 변경 될시 update function 을 부른다
    d3.select('#year-slider').call(
        d3.slider()
        .axis(true).min(1978).max(2017).step(1)
        .value([crtFromYear, crtToYear])
        .on("slideend", function(evt, value) {
            // 현재 년도를 저장해 놓는다
            crtFromYear = value[0];
            crtToYear = value[1];
            //clearBrush();
            bcConfigs.forEach((config) => updateTotal(config, records, crtFromYear, crtToYear,
                crtFromMagnitude, crtToMagnitude));
        }));

    d3.select('#magnitude-slider').call(
        d3.slider()
        .axis(true).min(1).max(6)
        .value([crtFromMagnitude, crtToMagnitude])
        .on("slideend", function(evt, value) {
            // 현재 규모를 저장해 놓는다
            crtFromMagnitude = value[0];
            crtToMagnitude = value[1];
            //clearBrush();
            bcConfigs.forEach((config) => updateTotal(config, records, crtFromYear, crtToYear,
                crtFromMagnitude, crtToMagnitude));
        }));

    // var shapeData = ["년도", "규모", "지역"],
    //     j = 0; // Choose the rectangle as default

    // Create the shape selectors
    // d3.select('#bar-chart-title').append("form")
    //     .selectAll("label")
    //     .data(shapeData)
    //     .enter()
    //     .append("label")
    //     .text(function(d) { return d; })
    //     .insert("input")
    //     .attr({
    //         type: "radio",
    //         class: "shape",
    //         name: "mode",
    //         value: function(d, i) { return i; }
    //     })
    //     .property("checked", function(d, i) {
    //         return i === j;
    //     })
    //     .on("change", function(d) {
    //         bcConfig.currentState = d;
    //         chartTransition(bcConfig);
    //     });
});