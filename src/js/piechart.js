var pieConfig = {};
pieConfig['colorVec'] = ["#2c7bb6", "#1a9641", "#fdae61", "#d7191c"];
pieConfig['dimension'] = { 'width': 350, 'height': 350 };
pieConfig.dimension['radius'] = Math.min(pieConfig.dimension.width, pieConfig.dimension.height) / 2;

function pieChart(id, statistics) {

    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("a simple tooltip");

    console.log(statistics);
    var width = 300;
    var height = 300;
    var radius = Math.min(width, height) / 2;

    pieConfig.svg = d3.select("#pie-charts").append('svg')
        .attr("width", pieConfig.dimension.width)
        .attr("height", pieConfig.dimension.height)
        .append("g");

    pieConfig.pie = d3.layout.pie()
        .value(function(d) { return d[1]; });

    pieConfig.svg.append("g")
        .attr("class", "slices");
    pieConfig.svg.append("g")
        .attr("class", "labels");
    pieConfig.svg.append("g")
        .attr("class", "lines");


    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) {
            return d[1];
        });

    var arc = d3.svg.arc()
        .outerRadius(radius * 0.8)
        .innerRadius(radius * 0.4);

    var outerArc = d3.svg.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    pieConfig.svg.attr("transform", "translate(" + pieConfig.dimension.width / 2 + "," + pieConfig.dimension.height / 2 + ")");

    var key = function(d) {
        return d.data[0];
    };

    var color = d3.scale.ordinal()
        .domain(["1-3", "3-4", "4-5", "5-6", "adipisicing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt"])
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);


    function change(data) {
        var tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .text("a simple tooltip");

        /* ------- PIE SLICES -------*/
        var slice = pieConfig.svg.select(".slices").selectAll("path.slice")
            .data(pie(data), key);

        slice.enter()
            .insert("path")
            .style("fill", function(d) {
                return color(d.data[0]);
            })
            .attr("class", "slice");

        slice
            .transition().duration(500)
            .attrTween("d", function(d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    return arc(interpolate(t));
                };
            });

        slice.on('mouseover', function(d, i) {
            console.log(d.data[0] + ", " + d.data[1]);
            tooltip.style("visibility", "visible");
            d3.select(this).style("opacity", 0.5);
            emphasizeRecords((rec) => getRange(rec.magnitude) === d.data[0]);
        })
            .on("mousemove", function(d) {
                tooltip.text(d.data[0] + ", " + d.data[1]);
                tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px")
                    .style("background-color", "skyblue").style("font-size", "24px");
            })
            .on("mouseout", function() {
                d3.select(this).style("opacity", 1);
                tooltip.style("visibility", "hidden");
                emphasizeRecords((rec) => true);
            });

        slice.exit()
            .remove();

        /* ------- TEXT LABELS -------*/

        var text = pieConfig.svg.select(".labels").selectAll("text")
            .data(pie(data), key);

        text.enter()
            .append("text")
            .attr("dy", ".35em")
            .text(function(d) {
                return d.data[0];
            });

        function midAngle(d){
            return d.startAngle + (d.endAngle - d.startAngle)/2;
        }

        text.transition().duration(500)
            .attrTween("transform", function(d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    var pos = outerArc.centroid(d2);
                    pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                    return "translate("+ pos +")";
                };
            })
            .styleTween("text-anchor", function(d){
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    return midAngle(d2) < Math.PI ? "start":"end";
                };
            });

        text.exit()
            .remove();

        /* ------- SLICE TO TEXT POLYLINES -------*/
        //
        var polyline = pieConfig.svg.select(".lines").selectAll("polyline")
            .data(pie(data), key);

        polyline.enter()
            .append("polyline");

        polyline.transition().duration(500)
            .attrTween("points", function(d){
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                var _this = this;
                return function(t) {
                    var d2 = interpolate(t);
                    _this._current = d2;
                    var pos = outerArc.centroid(d2);
                    pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                    return [arc.centroid(d2), outerArc.centroid(d2), pos];
                };
            });

        polyline.exit()
            .remove();
    };

    change(statistics);

    return change;
}
