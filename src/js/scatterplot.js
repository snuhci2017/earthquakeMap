var descriptionEpicenterMap = 'DESCRIPTION: This map shows epicenters of earthquakes which have occurred near Korea. ' +
    'X and Y axis mean longitude and latitude, respectively. ' +
    'The color and radius of each circle means the magnitude of an earthquake (Blue: x < 3, Red: 3 <= x < 4, Orange: 4 <= x). ' +
    'The radius of each circle also increases with its magnitude. ' +
    'Additionally, you can see the statistics of earthquakes which have occurred in a region by using brush.';

var emConfig = {};
emConfig['frame'] = { 'width': 550, 'height': 750 }; // The size of the frame in HTML doc.
emConfig['plot'] = { 'width': 439, 'height': 638 };
emConfig['margin'] = { left: 50, bottom: 50 };
emConfig['longitude'] = { left: 122, right: 132 };
emConfig['latitude'] = { top: 43, bottom: 32 };

// 위-경도 plot을 초기화 한다.
// 규모별로 dot의 색깔과 크기를 지정하는 룰을 전달할 수 있다 (colorRule & radiusRule, respectively).
function setupEpicenterMap(colorRule, radiusRule) {
    emConfig.svg = d3.select('#epicenter-plot').append('svg')
        .attr('width', emConfig.frame.width)
        .attr('height', emConfig.frame.height);

    emConfig.x = d3.scale.linear() // X 축 초기화 => 경도
        .domain([emConfig.longitude.left, emConfig.longitude.right])
        .range([emConfig.margin.left, emConfig.plot.width + emConfig.margin.left]);

    emConfig.y = d3.scale.linear() // Y 축 초기화 => 위도
        .domain([emConfig.latitude.bottom, emConfig.latitude.top])
        .range([emConfig.plot.height, 0]);

    emConfig.colorRule = colorRule;
    emConfig.radiusRule = radiusRule;

    emConfig.axis_x = d3.svg.axis()
        .scale(emConfig.x)
        .orient('bottom');

    emConfig.svg
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', translate(0, emConfig.plot.height))
        .call(emConfig.axis_x);

    emConfig.svg.append('text') // X 축 레이블 테스트 추가
        .attr('transform', translate((emConfig.plot.width + emConfig.margin.left) / 2, (emConfig.plot.height + emConfig.margin.bottom)))
        .style('text-anchor', 'middle')
        .text('Longitude')
        .attr('font-size', 18);

    emConfig.axis_y = d3.svg.axis()
        .scale(emConfig.y)
        .orient('left');

    emConfig.svg
        .append('g')
        .attr('class', 'y axis')
        .attr('transform', translate(emConfig.margin.left, 0))
        .call(emConfig.axis_y);

    emConfig.svg.append('text') // Y 축 레이블 테스트 추가
        .attr('transform', 'rotate(-90)')
        .attr('y', 0)
        .attr('x', 0 - (emConfig.plot.height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Latitude')
        .attr('font-size', 18);

    emConfig.brush = d3.svg.brush()
        .x(emConfig.x)
        .y(emConfig.y)
        .on('brush', update)
        .on('brushend', update)

    function update() {
        var extent = emConfig.brush.extent();
        var widthRange = [extent[0][0], extent[1][0]];
        var lengthRange = [extent[0][1], extent[1][1]];
        var magnitudeSum = 0,
            n = 0;

        emConfig.svg
            .selectAll('circle')
            .style('opacity', 0.5)
            .filter((d) => (widthRange[0] <= d.longitude.value && d.longitude.value <= widthRange[1] &&
            lengthRange[0] <= d.latitude.value && d.latitude.value <= lengthRange[1]))
            .style('opacity', 1)
            .each((d) => {
                n++;
                magnitudeSum += d.magnitude;
            });

        if (n > 0) {
            d3.select('#mean-magnitude').text(d3.format('.2f')(magnitudeSum / n));
            d3.select('#num-occurrences').text(d3.format('f')(n));
        }
    }

    // TODO: 브러쉬는 일시적으로 비활성화 (개선 필요)
    // emConfig.svg
    //     .append('g')
    //     .attr('class', 'brush')
    //     .call(emConfig.brush)

}

// 주어진 레코드를 위-경도 plot에 점으로 출력한다. 점의 킉와 색상은 초기화 시 설정한 룰들을 이용한다.
function updateEpicenterMap(records) {
    var circles = emConfig.svg
        .selectAll('circle')
        .data(records, (d, i) => i);

    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("a simple tooltip");

    circles.exit().transition().duration(200).remove();

    circles.transition().duration(200)
        .attr('r', (d) => determineRadius(d.magnitude, emConfig.radiusRule))
        .attr('cx', (d) => emConfig.x(d.longitude.value))
        .attr('cy', (d) => emConfig.y(d.latitude.value))
        .style('fill', (d) => determineColor(d.magnitude, emConfig.colorRule));

    circles.enter()
        .append('circle')
        .attr('r', (d) => determineRadius(d.magnitude, emConfig.radiusRule))
        .attr('cx', (d) => emConfig.x(d.longitude.value))
        .attr('cy', (d) => emConfig.y(d.latitude.value))
        .style('fill', (d) => determineColor(d.magnitude, emConfig.colorRule))
        .on('mouseover', function() {
            tooltip.style("visibility", "visible");
        })
        .on("mousemove", function(d) {
            var date = d.occurred_date.year.toString() +
                "." + d.occurred_date.month.toString() +
                "." + d.occurred_date.day.toString() +
                " " + d.occurred_date.hour.toString() +
                ":" + d.occurred_date.minute.toString();

            tooltip.text("시간: " + date + "\n" +
                "위치: " + d.latitude.value + d.latitude.direction + ", " +
                d.longitude.value + d.longitude.direction + "\n규모: " + d.magnitude);
            tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        });
}



// magnitude 에 따라 점의 색깔을 결정한다.
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

// magnitude 에 따라 점의 크기를 결정한다.
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