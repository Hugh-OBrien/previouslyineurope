var map = new Datamap({
  element: document.getElementById('map'),
  geographyConfig: {
    dataUrl: '/assets/topo/europe.json',
    borderColor: '#2b2727',
    backgroundColor: 'black',
    popupTemplate: function(geo, data) {
      var mentions
      if (data.mentions != -1) {
        mentions = 'Mentions : ' + data.mentions
      }
      return ['<div class="hoverinfo"><strong>',
              '<h3>' + geo.properties.name + '</h3>',
              mentions,
              '</strong></div>'].join('');
    }
  },
  scope: 'europe',
  setProjection: function(element, options) {
    var projection = d3.geo.albers()
                       .center([20, 52])
                       .rotate([0, 0])
                       .parallels([50, 60])
                       .scale(1000)
                       .translate(
                         [element.offsetWidth / 2, element.offsetHeight / 2]
                       );
    var path =  d3.geo.path()
                  .projection(projection);
    return {path: path, projection: projection};
  },
  fills: {
    good: 'green',
    bad: 'red',
    medium: 'blue',
    UNKNOWN: 'rgb(0,0,0)',
    defaultFill: 'grey'
  }
});

function updateInfo(data) {
  window.data = data
  var onlyValues = data.map(function(obj) { return obj.mentions; });
  var minValue = Math.min.apply(null, onlyValues),
      maxValue = Math.max.apply(null, onlyValues);

  var paletteScale = d3.scale.linear()
                       .domain([minValue,maxValue])
                       .range(["#EFEFFF","#02386F"]);
  var obj = {}
  var colors = []
  for(var i=0; i < data.length; i++){
    var color = paletteScale(data[i].mentions)
    obj[data[i].country] = {mentions: data[i].mentions, fillColor: color}
    colors.push(color)
  }
  map.updateChoropleth(obj);
  generateLegend(onlyValues, colors);
}

function updateInfoNone(data) {
  window.data = data

  for(var i=0; i < data.length; i++){
    var obj = {}
    obj[data[i].country] = {mentions: -1, fillColor: 'grey'}
    map.updateChoropleth(obj);
  }
}

function switchData() {
  if (mapState === 'mentions') {
    updateInfoNone(window.data)
    mapState = 'political'
  } else {
    updateInfo(window.data)
    mapState = 'mentions'
  }
}

function generateLegend(data, colors) {
  var formatPercent = d3.format(".0%"),
      formatNumber = d3.format(".0f");

  var threshold = d3.scale.linear()
                    .domain(data)
                    .range(colors);

  var x = d3.scale.linear()
            .domain([0, 1])
            .range([0, 240]);

  var xAxis = d3.svg.axis(x)
                .tickSize(13)
                .tickValues(threshold.domain())
                .tickFormat(function(d) { return d === 0.5 ? formatPercent(d) : formatNumber(100 * d); });

  var g = d3.select("#legend").call(xAxis);

  g.select(".domain")
   .remove();

  g.selectAll("rect")
   .data(threshold.range().map(function(color) {
     var d = threshold
     if (d[0] == null) d[0] = x.domain()[0];
     if (d[1] == null) d[1] = x.domain()[1];
     return d;
   }))
   .enter().insert("rect", ".tick")
   .attr("height", 8)
   .attr("x", function(d) { return x(d[0]); })
   .attr("width", function(d) { return x(d[1]) - x(d[0]); })
   .attr("fill", function(d) { return threshold(d[0]); });

  g.append("text")
   .attr("fill", "#000")
   .attr("font-weight", "bold")
   .attr("text-anchor", "start")
   .attr("y", -6)
   .text("Mentions on the podcast by country");
}

window.addEventListener('DOMContentLoaded', init)
