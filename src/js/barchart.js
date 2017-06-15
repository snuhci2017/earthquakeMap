var descriptionBarChart = 'DESCRIPTION: This bar chart shows how the occurrence of earthquakes near Korea has changed since 1978. ' +
    'Labels on X axis means each year and them of Y axis means the number of earthquake occurrence in each year. ' +
    'From this visualization you can easily find the number of occurrences dramatically changed in 2016 with an earthquake largest in scale.';

// Default configuration to set up a bar chart.
// var bcConfig = {};
// bcConfig['frame'] = { 'width': 700, 'height': 350 }; // The size of the frame in HTML doc.
// bcConfig['margin'] = { top: 20, right: 20, bottom: 60, left: 50 };
// bcConfig['chart'] = {
//     'width': bcConfig.frame.width - bcConfig.margin.left - bcConfig.margin.right,
//     'height': bcConfig.frame.height - bcConfig.margin.top - bcConfig.margin.bottom
// };

function setupBcConfig(id, label_x, frame) {
    var bcConfig = {};
    bcConfig['id'] = id;
    bcConfig['label_x'] = label_x;
    bcConfig['frame'] = { width: frame.width, height: frame.height }; // The size of the frame in HTML doc.
    bcConfig['margin'] = { top: 20, right: 20, bottom: 80, left: 70 };
    bcConfig['chart'] = {
        width: bcConfig.frame.width - bcConfig.margin.left - bcConfig.margin.right,
        height: bcConfig.frame.height - bcConfig.margin.top - bcConfig.margin.bottom
    };

    return bcConfig;
}

function getOccurStatistics(records, getVarFromRecord) {
    var statistics = new Map();

    records.forEach((record) => {
        var variable = getVarFromRecord(record);
        if (!statistics.has(variable))
            statistics.set(variable, 1);
        else
            statistics.set(variable, statistics.get(variable) + 1);
    });

    var data = [];
    statistics.forEach((value, key, map) => data.push([key, value]));
    return data.sort((a, b) => a[0].localeCompare(b[0]));
}

function getMagnitudeStatistics(records, getVarFromRecord) {
    var statistics = new Map();

    records.forEach((record) => {
        var variable = getVarFromRecord(record);
        if (!statistics.has(variable)) {
            statistics.set(variable, [record.magnitude, 1]);
        } else {
            var [sumOfMagnitude, numOfOccur] = statistics.get(variable);
            statistics.set(variable, [sumOfMagnitude + record.magnitude, 1 + numOfOccur]);
        }
    });

    var data = [];
    statistics.forEach((v, k, map) => {
        var [sumOfMagnitude, numOfOccur] = v;
        data.push([k, sumOfMagnitude / numOfOccur]);
    });
    return data.sort((a, b) => a[0].localeCompare(b[0]));
}

// compute statistics (# of occurrences per year) from the given records.
function getYearOccurStatistics(records) {
    return getOccurStatistics(records, function(record) {
        return record.occurred_date.year.toString();
    });
}

function getRange(magnitude) {
    if (magnitude < 3) {
        return '1-3'
    } else if (magnitude < 4) {
        return '3-4'
    } else if (magnitude < 5) {
        return '4-5'
    } else {
        return '5-6'
    }
}

function getMagnitudeOccurStatistics(records) {

    return getOccurStatistics(records, function(record) {
        return getRange(record.magnitude);
    });
}

function getLocationOccurStatistics(records) {
    return getOccurStatistics(records, function(record) {
        return record.location;
    });
}

function getYearMagnitudeStatistics(records) {
    return getMagnitudeStatistics(records, function(record) {
        return record.occurred_date.year.toString();
    });
}

// shows yearly statistics of occurrence of earthquakes in a bar chart.
function setupBarChart(bcConfig) {
    bcConfig.x = d3.scale.ordinal().rangeRoundBands([0, bcConfig.chart.width], .05);
    bcConfig.y = d3.scale.linear().range([bcConfig.chart.height, 0]);
    bcConfig.x.domain([]);
    bcConfig.y.domain([0, 0]);
    bcConfig.axis_x = d3.svg.axis().scale(bcConfig.x).orient('bottom');
    bcConfig.axis_y = d3.svg.axis().scale(bcConfig.y).orient('left').ticks(10);

    bcConfig.svg = d3.select(bcConfig.id).append('svg')
        .attr('width', bcConfig.frame.width)
        .attr('height', bcConfig.frame.height)
        .append('g')
        .attr('transform', translate(bcConfig.margin.left, bcConfig.margin.top));

    bcConfig.svg.append('g') // bcConfig the X axis
        .attr('class', 'x axis')
        .attr('transform', translate(0, bcConfig.chart.height))
        .call(bcConfig.axis_x)
        .selectAll('text')
        .style('text-anchor', 'end')
        .style("font-size", "34px")
        .attr('dx', '-.8em')
        .attr('dy', '-.55em')
        .attr('transform', 'rotate(-90)');

    bcConfig.svg.append('text') // text label for the X axis
        .attr('transform', translate((bcConfig.chart.width / 2), (bcConfig.chart.height + bcConfig.margin.bottom - 2)))
        .style('text-anchor', 'middle')
        .text(bcConfig.label_x)
        .style('font-size', '20px');

    bcConfig.svg.append('g') // bcConfig the Y axis
        .attr('class', 'y axis')
        .call(bcConfig.axis_y)
        .append('text')
        .style("font-size", "34px")
        .attr('transform', 'rotate(-90)')
        .attr('dy', '.71em');

    bcConfig.y_text = bcConfig.svg.append('text') // text label for the Y axis
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - bcConfig.margin.left)
        .attr('x', 0 - (bcConfig.chart.height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('발생 횟수')
        .style("font-size", "20px");
}

function updateChart(data, bcConfig, emphasize) {
    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("a simple tooltip");

    // update the domain of the X and Y axis to reflect change in statistics.
    bcConfig.x.domain(data.map((d) => d[0]));
    bcConfig.y.domain([0, d3.max(data, (d) => d[1])]);

    var bars = bcConfig.svg.selectAll("rect").data(data, (d) => d[0]);

    bcConfig.svg.select(".x.axis") // update the X axis
        .transition().duration(400)
        .call(bcConfig.axis_x)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '-.55em')
        .attr('transform', 'rotate(-90)');

    bcConfig.svg.select(".y.axis") // update the Y axis
        .transition().duration(400)
        .call(bcConfig.axis_y);

    // update bars in the chart.
    bars.exit().remove();

    var oldData = bcConfig.filteredData;

    bars.enter()
        .append('rect')
        .attr('x', (d) => bcConfig.x(d[0]))
        .attr('width', bcConfig.x.rangeBand())
        .style('opacity', 0)
        .on('mouseover', function(d, i) {
            console.log(d[0] + ", " + d[1]);
            tooltip.style("visibility", "visible");
            d3.select(this)
                .style("fill", "red");
            emphasizeRecords((rec) => emphasize(rec, d));
            var newData = oldData.filter((rec) => emphasize(rec, d));
            updateChartFromBrush(bcConfig.other, newData);
        })
        .on("mousemove", function(d) {
            tooltip.text(d[0] + ", " + d[1]);
            tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px")
                .style("background-color", "skyblue").style("font-size", "24px");
        })
        .on("mouseout", function() {
            d3.select(this).style("fill", "steelblue");
            tooltip.style("visibility", "hidden");
            emphasizeRecords((rec) => true);
            updateChartFromBrush(bcConfig.other, oldData);
        });

    bars.transition().duration(400)
        .attr('x', (d) => bcConfig.x(d[0]))
        .attr('width', bcConfig.x.rangeBand())
        .attr('y', (d) => bcConfig.y(d[1]))
        .attr('height', (d) => (bcConfig.chart.height - bcConfig.y(d[1])))
        .style('opacity', 1)
        .attr('fill', 'steelblue');

}

function toPie(bcConfig, filteredData) {
    bcConfig.svg.selectAll("rect").remove();

    var pie = d3.layout.pie()
        .value(function(d) {
            return d[1];
        });


    var g = bcConfig.svg.selectAll(".arc")
        .data(pie(filteredData))
        .enter()
        .append("g")
        .attr("class", "arc");

    var arc = d3.svg.arc();
    var color = d3.scale.category20();

    g.append("path")
        .style("fill", function(d, i) {
            return color(i);
        })
        .data(function() {
            return pie(filteredData);
        })
        .transition()
        .duration(1000)
        .tween("arc", arcTween);

    g.append("text")
        .transition()
        .duration(1000)
        .attr("dy", ".31em");

    var w = 960;
    var h = 500;

    function arcTween(d) {
        var path = d3.select(this),
            text = d3.select(this.nextSibling),
            x0 = bcConfig.x(d.data[0]),
            y0 = h - bcConfig.y(d.data[1]);

        text.text(d.data[0]);

        return function(t) {
            var r = h / 2 / Math.min(1, t + 1e-3),
                a = Math.cos(t * Math.PI / 2),
                xx = (-r + (a) * (x0 + bcConfig.x.rangeBand()) + (1 - a) * (w + h) / 2),
                yy = ((a) * h + (1 - a) * h / 2),
                f = {
                    innerRadius: r - bcConfig.x.rangeBand() / (2 - a),
                    outerRadius: r,
                    startAngle: a * (Math.PI / 2 - y0 / r) + (1 - a) * d.startAngle,
                    endAngle: a * (Math.PI / 2) + (1 - a) * d.endAngle
                };

            path.attr("transform", "translate(" + xx + "," + yy + ")");
            path.attr("d", arc(f));
            text.attr("transform", "translate(" + arc.centroid(f) + ")translate(" + xx + "," + yy + ")rotate(" + ((f.startAngle + f.endAngle) / 2 + 3 * Math.PI / 2) * 180 / Math.PI + ")");
        };
    }
}

// update the bars according to the given records.
function updateYearOccur(bcConfig, records) {
    var data = getYearOccurStatistics(records);
    updateChart(data, bcConfig, function(rec, d) {
        return rec.occurred_date.year.toString() === d[0];
    });

    // setTimeout(toPie, 2000, bcConfig, data);
}

function updateMagnitudeOccur(bcConfig, records) {}

function updateLocationOccur(bcConfig, records) {
    var data = getLocationOccurStatistics(records);
    updateChart(data, bcConfig, function(rec, d) {
        return rec.location === d[0];
    })
}

function updateYearMagnitude(bcConfig, records) {
    var data = getYearMagnitudeStatistics(records);
    bcConfig.x_text.text("년도");
    bcConfig.y_text.text("평균 규모");
    updateChart(data, bcConfig, function(rec, d) {
        return rec.occurred_date.year.toString() === d[0];
    })
}

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

    bcConfig.filteredData = updateEpicenterMap(filtered);

    if (bcConfig.id === "#yearly-statistics")
        updateYearOccur(bcConfig, bcConfig.filteredData);
    else if (bcConfig.id === "#regional-statistics")
        updateLocationOccur(bcConfig, bcConfig.filteredData);

    bcConfig.change(getMagnitudeOccurStatistics(bcConfig.filteredData));
}

function chartTransition(bcConfig) {
    if (bcConfig.id === "#yearly-statistics")
        updateYearOccur(bcConfig, bcConfig.filteredData);
    else if (bcConfig.id === "#regional-statistics")
        updateLocationOccur(bcConfig, bcConfig.filteredData);
}

function updateChartFromBrush(bcConfig, brushedData) {
    bcConfig.filteredData = brushedData;
    if (bcConfig.id === "#yearly-statistics")
        updateYearOccur(bcConfig, bcConfig.filteredData);
    else if (bcConfig.id === "#regional-statistics")
        updateLocationOccur(bcConfig, bcConfig.filteredData);

    bcConfig.change(getMagnitudeOccurStatistics(brushedData));
}