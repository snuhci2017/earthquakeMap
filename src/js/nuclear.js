/**
 * Created by DoogieMin on 15/06/2017.
 */
var nuclearData = [
    {
        "occurred_date": "1978-04-29 0:00",
        "name": "고리 원자력 발전소",
        "latitude": "35.19 N",
        "longitude": "129.17 E"
    },
    {
        "occurred_date": "1983-04-22 0:00",
        "name": "월성 원자력 발전소",
        "latitude": "35.42 N",
        "longitude": "129.28 E"
    },
    {
        "occurred_date": "1986-08-25 0:00",
        "name": "한빛 원자력 발전소",
        "latitude": "35.24 N",
        "longitude": "126.25 E"
    },
    {
        "occurred_date": "1988-09-10 0:00",
        "name": "한울 원자력 발전소",
        "latitude": "37.54 N",
        "longitude": "129.23 E"
    },
];

function drawNuclear() {
    var nuclearRecords = readNuclear(nuclearData);

    var circles = emConfig.svg
        .selectAll('nuclearCircle')
        .data(nuclearRecords, (d) => d.id);

    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("a simple tooltip");

    circles.exit().transition().duration(200)
        .attr('r', (d) => 0)
        .attr('cx', (d) => (emConfig.plot.width + emConfig.margin.left) / 2)
        .attr('cy', (d) => (emConfig.plot.height + emConfig.margin.bottom) / 2)
        .remove();

    circles.transition().duration(200)
        .attr('r', (d) => 10)
        .attr('cx', (d) => emConfig.x(d.longitude.value))
        .attr('cy', (d) => emConfig.y(d.latitude.value))
        .style('fill', (d) => '#5e7cff')
        .style('stroke', 'red')
        .style('opacity', 1);

    circles.enter()
        .append('circle')
        .attr('r', (d) => 0)
        .attr('cx', (d) => (emConfig.plot.width + emConfig.margin.left) / 2)
        .attr('cy', (d) => (emConfig.plot.height + emConfig.margin.bottom) / 2)
        .on('mouseover', function() {
            tooltip.style("visibility", "visible");
        })
        .on("mousemove", function(d) {
            var date = d.occurred_date.year.toString() +
                "." + d.occurred_date.month.toString() +
                "." + d.occurred_date.day.toString();

            tooltip.text("시간: " + date + "\n" +
                "위치: " + d.latitude.value.toFixed(3) + d.latitude.direction + ", " +
                d.longitude.value.toFixed(3) + d.longitude.direction);
            tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        }).transition().duration(200)
        .attr('r', (d) => 10)
        .attr('cx', (d) => emConfig.x(d.longitude.value))
        .attr('cy', (d) => emConfig.y(d.latitude.value))
        .style('fill', (d) => '#5e7cff')
        .style('stroke', 'red')
        .style('opacity', 1);

}