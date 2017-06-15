var pieConfig = {};
pieConfig['colorVec'] = ["#2c7bb6", "#1a9641", "#fdae61", "#d7191c"];
pieConfig['demension'] = { 'width': 350, 'height': 350 };
pieConfig.demension['radius'] = Math.min(pieConfig.demension.width, pieConfig.demension.height) / 2;

function pieChart(id, statistics) {

    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("a simple tooltip");

    console.log(statistics);
    var width = 250;
    var height = 250;
    pieConfig.svg = d3.select("#pie-charts").append('svg')
        .attr("width", pieConfig.demension.width)
        .attr("height", pieConfig.demension.height)
        .append("g").attr("transform", "translate(" + pieConfig.demension.width / 2 + "," + pieConfig.demension.height / 2 + ")");

    function key2Index(key) {
        console.log(key);
        if (key === '1-3') {
            return 0;
        } else if (key === '3-4') {
            return 1;
        } else if (key === '4-5') {
            return 2;
        } else {
            return 3;
        }
    }

    pieConfig.pie = d3.layout.pie()
        .value(function(d) { return d[1]; });

    pieConfig.arc = d3.svg.arc()
        .outerRadius(pieConfig.demension.radius - 10)
        .innerRadius(0);

    pieConfig.label = d3.svg.arc()
        .outerRadius(pieConfig.demension.radius - 40)
        .innerRadius(pieConfig.demension.radius - 40);

    pieConfig.g = pieConfig.svg.selectAll("arc")
        .data(function() {
            return pieConfig.pie(statistics);
        }).enter().append("g")
        .attr("class", "arc");

    pieConfig.g.append("path")
        .attr("d", pieConfig.arc)
        .each(function(d) { this._current = d; })
        .attr("fill", function(d) { return pieConfig.colorVec[key2Index(d.data[0])]; })
        .attr("opacity", 0.7)
        .on('mouseover', function(d, i) {
            console.log(d.data[0] + ", " + d.data[1]);
            tooltip.style("visibility", "visible");
            d3.select(this)
                .style("opacity", 1);
            emphasizeRecords(function(rec) {
                if (d.data[0] === '1-3') {
                    return (1 <= rec.magnitude && rec.magnitude < 3);
                } else if (d.data[0] === '3-4') {
                    return (3 <= rec.magnitude && rec.magnitude < 4);
                } else if (d.data[0] === '4-5') {
                    return (4 <= rec.magnitude && rec.magnitude < 5);
                } else {
                    return (5 <= rec.magnitude && rec.magnitude <= 6);
                }
            });
        })
        .on("mousemove", function(d) {
            tooltip.text(d.data[0] + ", " + d.data[1]);
            tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px")
                .style("background-color", "skyblue").style("font-size", "24px");
        })
        .on("mouseout", function() {
            d3.select(this).style("opacity", 0.7);
            tooltip.style("visibility", "hidden");
            emphasizeRecords((rec) => true);
        });;

    // pieConfig.g.append("text")
    //     .attr("transform", function(d) { return "translate(" + pieConfig.label.centroid(d) + ")"; })
    //     .text(function(d) { return d.data[0]; })
    //     .style("fill", "#fff")
    //     .each(function(d) { this._current = d; });
}

function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) { return pieConfig.arc(i(t)); };
}

function labelarcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
        return "translate(" + pieConfig.label.centroid(i(t)) + ")";
    };
}

function findRecordByName(records, targetName) {
    return records.filter((rec) => rec[0] === targetName).length > 0;
}

function updatePieChart(statistics) {
    if (!findRecordByName(statistics, '1-3')) {
        console.log("add 1-3");
        statistics.push(['1-3', 0]);
    }

    if (!findRecordByName(statistics, '3-4')) {
        statistics.push(['3-4', 0]);
    }

    if (!findRecordByName(statistics, '4-5')) {
        statistics.push(['4-5', 0]);
    }

    if (!findRecordByName(statistics, '5-6')) {
        statistics.push(['5-6', 0]);
    }

    console.log(statistics);
    path = d3.select("#pie-charts").selectAll("path").data(pieConfig.pie(statistics), (d) => d.data[0]);

    path.transition().duration(200)
        .attrTween("d", arcTween);

    //d3.select("#pie-charts").selectAll("text").data(pieConfig.pie(statistics)).transition().duration(200).attrTween("transform", labelarcTween);
}