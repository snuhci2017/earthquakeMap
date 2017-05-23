var descriptionBarChart = 'DESCRIPTION: This bar chart shows how the occurrence of earthquakes near Korea has changed since 1978. ' +
    'Labels on X axis means each year and them of Y axis means the number of earthquake occurrence in each year. ' +
    'From this visualization you can easily find the number of occurrences dramatically changed in 2016 with an earthquake largest in scale.';
var config_BarChart = {}
config_BarChart['frame'] = { 'width': 800, 'height': 600 } // The size of the frame in HTML doc.
config_BarChart['margin'] = { top: 20, right: 20, bottom: 70, left: 60 }
config_BarChart['chart'] = {
    'width': config_BarChart.frame.width - config_BarChart.margin.left - config_BarChart.margin.right,
    'height': config_BarChart.frame.height - config_BarChart.margin.top - config_BarChart.margin.bottom
}

function showBarChart(records, fromYear, toYear) {
    var config = config_BarChart;
    var intensitySum = 0;
    var numOccurrence = 0;
    var statistics = new Map();

    records.filter(function(record) {
        var year = record['occurred date'].year;
        return (fromYear <= year && year <= toYear);
    }).forEach(function(record) {
        var year = record['occurred date'].year.toString();
        if (statistics.has(year)) {
            statistics.set(year, statistics.get(year) + 1);
        } else {
            statistics.set(year, 1);
        }
        intensitySum += record.scale;
        numOccurrence++;
    });

    var data = [];
    statistics.forEach(function(value, key, map) {
        data.push([key, value]);
    });

    data = data.sort(function(a, b) { return a[0] - b[0]; });

    var x = d3.scale.ordinal().rangeRoundBands([0, config.chart.width], .05);
    var y = d3.scale.linear().range([config.chart.height, 0]);

    x.domain(data.map(function(d) { return d[0]; }));
    y.domain([0, d3.max(data, function(d) { return d[1]; })]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom'); //.tickFormat(d3.format('.0s'));

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .ticks(10);

    var svg = d3.select('div').append('svg')
        .attr('id', 'chart')
        .attr('width', config.frame.width)
        .attr('height', config.frame.height)
        .append('g')
        .attr('transform',
            'translate(' + config.margin.left + ',' + config.margin.top + ')');

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + config.chart.height + ')')
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '-.55em')
        .attr('transform', 'rotate(-90)');

    svg.append('text') // text label for the x axis
        .attr('transform', 'translate(' + (config.chart.width / 2) + ' ,' + (config.chart.height + config.margin.bottom) + ')')
        .style('text-anchor', 'middle')
        .text('Year')
        .attr('font-size', 18);

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('dy', '.71em');

    svg.append('text') // text label for the y axis
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - config.margin.left)
        .attr('x', 0 - (config.chart.height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('#(Occurrence)')
        .attr('font-size', 18);

    svg
        .selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .style('fill', 'steelblue')
        .attr('x', function(d, i) {
            return x(d[0]);
        })
        .attr('width', x.rangeBand())
        .attr('y', function(d) { return y(d[1]); })
        .attr('height', function(d) {
            return config.chart.height - y(d[1]);
        });

    d3.select('#mean-intensity').text(d3.format('.2f')(intensitySum / numOccurrence));
    d3.select('#num-occurrences').text(d3.format('f')(numOccurrence));
    document.getElementById('description').textContent = descriptionBarChart;
}