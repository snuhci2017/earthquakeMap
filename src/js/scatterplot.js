var descriptionEpicenterMap = 'DESCRIPTION: This map shows epicenters of earthquakes which have occurred near Korea. ' +
    'X and Y axis mean longitude and latitude, respectively. ' +
    'The color and radius of each circle means the magnitude of an earthquake (Blue: x < 3, Red: 3 <= x < 4, Orange: 4 <= x). ' +
    'The radius of each circle also increases with its magnitude. ' +
    'Additionally, you can see the statistics of earthquakes which have occurred in a region by using brush.';

var config_EpicenterMap = {};
config_EpicenterMap['frame'] = { 'width': 550, 'height': 750 }; // The size of the frame in HTML doc.
config_EpicenterMap['plot'] = { 'width': 439, 'height': 638 };
config_EpicenterMap['margin'] = { left: 50, bottom: 50 };
config_EpicenterMap['longitude'] = { left: 122, right: 132 };
config_EpicenterMap['latitude'] = { top: 43, bottom: 32 };

// 주어진 레코드에서 진앙의 위치를 읽어 위-경도 plot에 출력한다. 
// 발생 시각과 규모 범위를 설정하여 출력할 레코드를 선택할 수 있다.
// 발생 시각(T) 범위 : fromYear <= T <= toYear
// 규모(M) 범위: fromMagnitude <= M <= toMagnitude 
function showEpicenterMap(records, fromYear, toYear, fromMagnitude, toMagnitude, colorRule, radiusRule) {

    var config = config_EpicenterMap;
    var data = records.filter(function(rec) {
        return (fromYear <= rec['occurred date'].year) && (rec['occurred date'].year <= toYear);
    }).filter(function(rec) {
        return (fromMagnitude <= rec.magnitude) && (rec.magnitude <= toMagnitude);
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
        .attr('r', function(d) { return determineRadius(d.magnitude, radiusRule); })
        .attr('cx', function(d) { return x(d.longitude.value); })
        .attr('cy', function(d) { return y(d.latitude.value); })
        .style('fill', function(d) { return determineColor(d.magnitude, colorRule); })

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
        var magnitudeSum = 0,
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
                magnitudeSum += d.magnitude;
            })

        if (n > 0) {
            d3.select('#mean-magnitude').text(d3.format('.2f')(magnitudeSum / n));
            d3.select('#num-occurrences').text(d3.format('f')(n));
        }
    }

    svg
        .append('g')
        .attr('class', 'brush')
        .call(brush)

    document.getElementById('description').textContent = descriptionEpicenterMap;
}

// magnitude에 따라 점의 색깔을 결정한다.
function determineColor(magnitude, colorRule) {
    var color = colorRule.default;

    for (i = 0; i < colorRule.rules.length; i++) {
        var rule = colorRule.rules[i];
        if (rule.from <= magnitude && magnitude < rule.to) {
            color = rule.color;
        }
    }

    return color;
}

// magnitude에 따라 점의 크기를 결정한다.
function determineRadius(magnitude, radiusRule) {
    var radius = radiusRule.default;

    for (i = 0; i < radiusRule.rules.length; i++) {
        var rule = radiusRule.rules[i];
        if (rule.from <= magnitude && magnitude < rule.to) {
            radius = rule.radius;
        }
    }

    return radius;
}