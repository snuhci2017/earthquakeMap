/**
 * Created by DoogieMin on 13/06/2017.
 */
function donut() {
    var g = svg.selectAll(".symbol");

    g.selectAll("rect").remove();

    var pie = d3.layout.pie()
        .value(function (d) {
            return d.sumPrice;
        });

    var arc = d3.svg.arc();

    g.append("path")
        .style("fill", function (d) {
            return color(d.key);
        })
        .data(function () {
            return pie(symbols);
        })
        .transition()
        .duration(duration)
        .tween("arc", arcTween);

    g.select("text").transition()
        .duration(duration)
        .attr("dy", ".31em");

    svg.select("line").transition()
        .duration(duration)
        .attr("y1", 2 * h)
        .attr("y2", 2 * h)
        .remove();

    function arcTween(d) {
        var path = d3.select(this),
            text = d3.select(this.parentNode.appendChild(this.previousSibling)),
            x0 = x(d.data.key),
            y0 = h - y(d.data.sumPrice);

        return function (t) {
            var r = h / 2 / Math.min(1, t + 1e-3),
                a = Math.cos(t * Math.PI / 2),
                xx = (-r + (a) * (x0 + x.rangeBand()) + (1 - a) * (w + h) / 2),
                yy = ((a) * h + (1 - a) * h / 2),
                f = {
                    innerRadius: r - x.rangeBand() / (2 - a),
                    outerRadius: r,
                    startAngle: a * (Math.PI / 2 - y0 / r) + (1 - a) * d.startAngle,
                    endAngle: a * (Math.PI / 2) + (1 - a) * d.endAngle
                };

            path.attr("transform", "translate(" + xx + "," + yy + ")");
            path.attr("d", arc(f));
            text.attr("transform", "translate(" + arc.centroid(f) + ")translate(" + xx + "," + yy + ")rotate(" + ((f.startAngle + f.endAngle) / 2 + 3 * Math.PI / 2) * 180 / Math.PI + ")");
        };
    }

    setTimeout(donutExplode, duration + delay);
}
