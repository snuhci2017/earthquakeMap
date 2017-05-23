var descriptionEpicenterMap = 'DESCRIPTION: This map shows epicenters of earthquakes which have occurred near Korea. ' +
    'X and Y axis mean longitude and latitude, respectively. ' +
    'The color and radius of each circle means the intensity of an earthquake (Blue: x < 3, Red: 3 <= x < 4, Orange: 4 <= x). ' +
    'The radius of each circle also increases with its intensity. ' +
    'Additionally, you can see the statistics of earthquakes which have occurred in a region by using brush.';

var config_EpicenterMap = {};
config_EpicenterMap['frame'] = { 'width': 550, 'height': 750 }; // The size of the frame in HTML doc.
config_EpicenterMap['plot'] = { 'width': 439, 'height': 638 };
config_EpicenterMap['margin'] = { left: 50, bottom: 50 };
config_EpicenterMap['longitude'] = { left: 122, right: 132 };
config_EpicenterMap['latitude'] = { top: 43, bottom: 32 };

function showEpicenterMap(records, fromYear, toYear) {

    var config = config_EpicenterMap;
    var data = records.filter(function(rec) {
        return (fromYear <= rec['occurred date'].year) && (rec['occurred date'].year <= toYear);
    });

    var svg = d3.select('div').append('svg')
        .attr('id', 'chart')
        .attr('width', config.frame.width)
        .attr('height', config.frame.height);

    var x = d3.scale.linear()
        .domain([config.longitude.left, config.longitude.right]) // longitude
        .range([config.margin.left, config.plot.width + config.margin.left]);

    var y = d3.scale.linear()
        .domain([config.latitude.bottom, config.latitude.top])
        .range([config.plot.height, 0]);

    svg
        .selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('r', function(d) { return determineRadius(d.scale); })
        .attr('cx', function(d) { return x(d.longitude.value); })
        .attr('cy', function(d) { return y(d.latitude.value); })
        .style('fill', function(d) { return determineColor(d.scale); })

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

    svg
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(' + 0 + ', ' + config.plot.height + ')')
        .call(xAxis);

    svg.append('text') // text label for the x axis
        .attr('transform', 'translate(' + ((config.plot.width + config.margin.left) / 2) + ', ' + (config.plot.height + config.margin.bottom) + ')')
        .style('text-anchor', 'middle')
        .text('Longitude')
        .attr('font-size', 18);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

    svg
        .append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + config.margin.left + ', ' + 0 + ')')
        .call(yAxis);

    svg.append('text') // text label for the y axis
        .attr('transform', 'rotate(-90)')
        .attr('y', 0)
        .attr('x', 0 - (config.plot.height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Latitude')
        .attr('font-size', 18);

    var brush = d3.svg.brush()
        .x(x)
        .y(y)
        .on('brush', update)
        .on('brushend', update)

    function update() {
        var extent = brush.extent();
        var widthRange = [extent[0][0], extent[1][0]];
        var lengthRange = [extent[0][1], extent[1][1]];
        var intensitySum = 0,
            n = 0;

        svg
            .selectAll('circle')
            .style('opacity', 0.5)
            .filter(function(d) {
                return widthRange[0] <= d.longitude.value && d.longitude.value <= widthRange[1] &&
                    lengthRange[0] <= d.latitude.value && d.latitude.value <= lengthRange[1];
            })
            .style('opacity', 1)
            .each(function(d) {
                n++;
                intensitySum += d.scale;
            })

        if (n > 0) {
            d3.select('#mean-intensity').text(d3.format('.2f')(intensitySum / n));
            d3.select('#num-occurrences').text(d3.format('f')(n));
        }
    }

    svg
        .append('g')
        .attr('class', 'brush')
        .call(brush)

    document.getElementById('description').textContent = descriptionEpicenterMap;
}

function determineColor(intensity) {
    if (0 <= intensity && intensity < 3) {
        return '#3366cc';
    } else if (3 <= intensity && intensity < 4) {
        return '#dc3912';
    } else if (4 <= intensity) {
        return '#ff9900';
    }
}

function determineRadius(intensity) {
    if (0 <= intensity && intensity < 3) {
        return 3.5;
    } else if (3 <= intensity && intensity < 4) {
        return 4.5;
    } else if (4 <= intensity) {
        return 5.5;
    }
}