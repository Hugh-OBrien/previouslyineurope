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
  generateScaleLegend(paletteScale, "Podcast Mentions");
}

function updateInfoNone(data) {
  window.data = data

  for(var i=0; i < data.length; i++){
    var obj = {}
    obj[data[i].country] = {mentions: -1, fillColor: 'grey'}
    map.updateChoropleth(obj);
    removeLegend();
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

function removeLegend() {
  var svg = d3.select("#legend");
  svg.selectAll("*").remove();
}

function generateScaleLegend(scale, title, blurb) {

  var svg = d3.select("#legend");

  svg.append("g")
     .attr("class", "legendLinear")
     .attr("transform", "translate(20,20)");

  var legendLinear = d3.legend.color()
                       .shapeWidth(30)
                       .cells(10)
                       .orient('horizontal')
                       .labelFormat(d3.format(".0f"))
                       .scale(scale)
                       .title(title);

  svg.select(".legendLinear")
     .call(legendLinear);
}

window.addEventListener('DOMContentLoaded', init)
