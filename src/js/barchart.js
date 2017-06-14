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

function setupBcConfig() {
    var bcConfig = {};
    bcConfig['frame'] = { width: 700, height: 350 }; // The size of the frame in HTML doc.
    bcConfig['margin'] = { top: 20, right: 20, bottom: 60, left: 50 };
    bcConfig['chart'] = {
        width: bcConfig.frame.width - bcConfig.margin.left - bcConfig.margin.right,
        height: bcConfig.frame.height - bcConfig.margin.top - bcConfig.margin.bottom
    };

    return bcConfig;
}

// compute statistics (# of occurrences per year) from the given records.
function getYearStatistics(records, fromYear, toYear) {
    var statistics = new Map();
    if (fromYear > toYear) {
        return [];
    } else {
        for (var year = fromYear; year <= toYear; year++) {
            if (!statistics.has(year)) {
                statistics.set(year.toString(), 0);
            }
        }
    }

    records.forEach((record) => {
        var year = record.occurred_date.year.toString();
        statistics.set(year, statistics.get(year) + 1);
    });

    var data = [];
    statistics.forEach((value, key, map) => data.push([key, value]));
    return data.sort((a, b) => (a[0] - b[0]));
}

function getRange(magnitude) {
    if (magnitude < 3) {
        return '0-3'
    } else if (magnitude < 4) {
        return '3-4'
    } else if (magnitude < 5) {
        return '4-5'
    } else {
        return '5-6'
    }
}

function getMagnitudeStatistics(records) {
    var statistics = new Map();

    records.forEach((record) => {
        var magnitude = record.magnitude;
        var range = getRange(magnitude);
        if (!statistics.has(range))
            statistics.set(range, 1);
        else
            statistics.set(range, statistics.get(range) + 1);
    });

    var data = [];
    statistics.forEach((value, key, map) => data.push([key, value]));
    return data.sort((a, b) => a[0].localeCompare(b[0]));
}

function getLocationStatistics(records) {
    var statistics = new Map();

    records.forEach((record) => {
        var location = record.location;
        if (!statistics.has(location))
            statistics.set(location, 1);
        else
            statistics.set(location, statistics.get(location) + 1);
    });

    var data = [];
    statistics.forEach((value, key, map) => data.push([key, value]));
    return data.sort((a, b) => a[0].localeCompare(b[0]));

}

// shows yearly statistics of occurrence of earthquakes in a bar chart.
function setupBarChart(bcConfig) {
    bcConfig.x = d3.scale.ordinal().rangeRoundBands([0, bcConfig.chart.width], .05);
    bcConfig.y = d3.scale.linear().range([bcConfig.chart.height, 0]);
    bcConfig.x.domain([]);
    bcConfig.y.domain([0, 0]);
    bcConfig.axis_x = d3.svg.axis().scale(bcConfig.x).orient('bottom');
    bcConfig.axis_y = d3.svg.axis().scale(bcConfig.y).orient('left').ticks(10);

    bcConfig.svg = d3.select('#yearly-statistics').append('svg')
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
        .attr('dx', '-.8em')
        .attr('dy', '-.55em')
        .attr('transform', 'rotate(-90)');

    bcConfig.svg.append('text') // text label for the X axis
        .attr('transform', translate((bcConfig.chart.width / 2), (bcConfig.chart.height + bcConfig.margin.bottom)))
        .style('text-anchor', 'middle')
        .text('년도')
        .attr('font-size', 20);

    bcConfig.svg.append('g') // bcConfig the Y axis
        .attr('class', 'y axis')
        .call(bcConfig.axis_y)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('dy', '.71em');

    bcConfig.svg.append('text') // text label for the Y axis
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - bcConfig.margin.left)
        .attr('x', 0 - (bcConfig.chart.height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('발생 횟수')
        .attr('font-size', 20);
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
        .transition().duration(200)
        .call(bcConfig.axis_x)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '-.55em')
        .attr('transform', 'rotate(-90)');

    bcConfig.svg.select(".y.axis") // update the Y axis
        .transition().duration(200)
        .call(bcConfig.axis_y);

    // update bars in the chart.
    bars.exit().remove();

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
        })
        .on("mousemove", function(d) {
            tooltip.text(d[0] + ", " + d[1]);
            tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).style("fill", "steelblue");
            tooltip.style("visibility", "hidden");
            emphasizeRecords((rec) => true);
        });

    bars.transition().duration(200)
        .attr('x', (d) => bcConfig.x(d[0]))
        .attr('width', bcConfig.x.rangeBand())
        .attr('y', (d) => bcConfig.y(d[1]))
        .attr('height', (d) => (bcConfig.chart.height - bcConfig.y(d[1])))
        .style('opacity', 1)
        .attr('fill', 'steelblue');

}

// update the bars according to the given records.
function updateBarChart(bcConfig, records, fromYear, toYear) {
    var data = getYearStatistics(records, fromYear, toYear);
    updateChart(data, bcConfig, function(rec, d) {
        return rec.occurred_date === d[0];
    });
    setTimeout(magnitudeTransition, 2000, bcConfig, records);
}

function magnitudeTransition(bcConfig, records) {
    var data = getMagnitudeStatistics(records);
    updateChart(data, bcConfig, function(rec, d) {
        return getRange(rec.magnitude) === d[0];
    });
    setTimeout(locationTransition, 2000, bcConfig, records);
}

function locationTransition(bcConfig, records) {
    var data = getLocationStatistics(records);
    updateChart(data, bcConfig, function(rec, d) {
        return rec.location === d[0];
    })
}