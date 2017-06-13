var descriptionBarChart = 'DESCRIPTION: This bar chart shows how the occurrence of earthquakes near Korea has changed since 1978. ' +
    'Labels on X axis means each year and them of Y axis means the number of earthquake occurrence in each year. ' +
    'From this visualization you can easily find the number of occurrences dramatically changed in 2016 with an earthquake largest in scale.';

// Default configuration to set up a bar chart.
var bcConfig = {};
bcConfig['frame'] = { 'width': 400, 'height': 300 }; // The size of the frame in HTML doc.
bcConfig['margin'] = { top: 20, right: 20, bottom: 50, left: 50 };
bcConfig['chart'] = {
    'width': bcConfig.frame.width - bcConfig.margin.left - bcConfig.margin.right,
    'height': bcConfig.frame.height - bcConfig.margin.top - bcConfig.margin.bottom
};

// compute statistics (# of occurrences per year) from the given records.
function getStatistics(records, fromYear, toYear) {
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

// shows yearly statistics of occurrence of earthquakes in a bar chart.
function setupBarChart() {
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
        .text('Year')
        .attr('font-size', 14);

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
        .text('#(Occurrence)')
        .attr('font-size', 14);
}

// update the bars according to the given records.
function updateBarChart(records, fromYear, toYear) {
    var data = getStatistics(records, fromYear, toYear);

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
        .transition().duration(200).ease("sin-in-out")
        .call(bcConfig.axis_x)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '-.55em')
        .attr('transform', 'rotate(-90)');

    bcConfig.svg.select(".y.axis") // update the Y axis
        .transition().duration(200).ease("sin-in-out")
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
                .style("fill", "blue");
        })
        .on("mousemove", function(d) {
            tooltip.text(d[0] + ", " + d[1]);
            tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).style("fill", "steelblue");
            tooltip.style("visibility", "hidden");
        });

    bars.transition().duration(200)
        .attr('x', (d) => bcConfig.x(d[0]))
        .attr('width', bcConfig.x.rangeBand())
        .attr('y', (d) => bcConfig.y(d[1]))
        .attr('height', (d) => (bcConfig.chart.height - bcConfig.y(d[1])))
        .style('opacity', 1)
        .attr('fill', 'steelblue');
}