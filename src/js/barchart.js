var descriptionBarChart = 'DESCRIPTION: This bar chart shows how the occurrence of earthquakes near Korea has changed since 1978. ' +
    'Labels on X axis means each year and them of Y axis means the number of earthquake occurrence in each year. ' +
    'From this visualization you can easily find the number of occurrences dramatically changed in 2016 with an earthquake largest in scale.';

// Default configuration to set up a bar chart.
var config = {}
config['frame'] = { 'width': 400, 'height': 300 } // The size of the frame in HTML doc.
config['margin'] = { top: 20, right: 20, bottom: 50, left: 50 }
config['chart'] = {
    'width': config.frame.width - config.margin.left - config.margin.right,
    'height': config.frame.height - config.margin.top - config.margin.bottom
}

function getStatistics(records) {
    var statistics = new Map();
    records.forEach((record) => {
        var year = record.occurred_date.year.toString();
        if (statistics.has(year)) {
            statistics.set(year, statistics.get(year) + 1);
        } else {
            statistics.set(year, 1);
        }
    });

    var data = [];
    statistics.forEach((value, key, map) => data.push([key, value]));
    return data.sort((a, b) => (a[0] - b[0]));
}

// shows yearly statistics of occurrence of earthquakes in a bar chart.
function setupBarChart(records) {
    config.x = d3.scale.ordinal().rangeRoundBands([0, config.chart.width], .05);
    config.y = d3.scale.linear().range([config.chart.height, 0]);
    config.x.domain([0, 0]);
    config.y.domain([0, 0]);
    //config.x.domain(data.map((d) => d[0]));
    //config.y.domain([0, d3.max(data, (d) => d[1])]);
    config.axis_x = d3.svg.axis().scale(config.x).orient('bottom');
    config.axis_y = d3.svg.axis().scale(config.y).orient('left').ticks(10);

    config.svg = d3.select('#yearly-statistics').append('svg')
        .attr('width', config.frame.width)
        .attr('height', config.frame.height)
        .append('g')
        .attr('transform', translate(config.margin.left, config.margin.top));

    config.svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', translate(0, config.chart.height))
        .call(config.axis_x)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '-.55em')
        .attr('transform', 'rotate(-90)');

    config.svg.append('text') // text label for the x axis
        .attr('transform', translate((config.chart.width / 2), (config.chart.height + config.margin.bottom)))
        .style('text-anchor', 'middle')
        .text('Year')
        .attr('font-size', 14);

    config.svg.append('g')
        .attr('class', 'y axis')
        .call(config.axis_y)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('dy', '.71em');

    config.svg.append('text') // text label for the y axis
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - config.margin.left)
        .attr('x', 0 - (config.chart.height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('#(Occurrence)')
        .attr('font-size', 14);

    // config.svg.selectAll("rect")
    //     .data(data)
    //     .enter()
    //     .append('rect')
    //     .style('fill', 'steelblue')
    //     .attr('x', (d) => config.x(d[0]))
    //     .attr('width', config.x.rangeBand())
    //     .attr('y', (d) => config.y(d[1]))
    //     .attr('height', (d) => (config.chart.height - config.y(d[1])));
    updateBarChart(records);
}

// create function to update the bars.
function updateBarChart(records) {
    var data = getStatistics(records);
    console.log("data" + data);
    // update the domain of the y-axis map to reflect change in frequencies.
    config.x.domain(data.map((d) => d[0]));
    config.y.domain([0, d3.max(data, (d) => d[1])]);

    var bars = config.svg.selectAll("rect").data(data, (d) => d[0]);

    config.svg.select(".x.axis") // change the x axis
        .transition().duration(200).ease("sin-in-out")
        .call(config.axis_x)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '-.55em')
        .attr('transform', 'rotate(-90)');

    config.svg.select(".y.axis") // change the y axis
        .transition().duration(200).ease("sin-in-out")
        .call(config.axis_y);

    // update bars in the chart.
    bars.exit().remove();

    bars.transition().duration(200)
        .attr('x', (d) => config.x(d[0]))
        .attr('width', config.x.rangeBand())
        .attr('y', (d) => config.y(d[1]))
        .attr('height', (d) => (config.chart.height - config.y(d[1])))
        .attr('fill', 'steelblue');

    bars.enter()
        .append('rect')
        .attr('x', (d) => config.x(d[0]))
        .attr('width', config.x.rangeBand())
        .style('opacity', 0)
        .on('mouseover', function() {
            d3.select(this).style("fill", "red");
        })
        .on("mouseout", function(d, i) {
            d3.select(this).style("fill", "steelblue");
        })
        .transition().duration(200)
        .attr('y', (d) => config.y(d[1]))
        .attr('height', (d) => (config.chart.height - config.y(d[1])))
        .style('opacity', 1)
        .style('fill', 'steelblue');
}