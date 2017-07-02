var map = new Datamap({
  element: document.getElementById('map'),
  geographyConfig: {
    dataUrl: '/assets/topo/europe.json',
    borderColor: '#2b2727',
    backgroundColor: 'black',
    popupTemplate: function(geo, data) {
      var mentions
      if (data.text != -1) {
        text = data.text
      }
      return ['<div class="hoverinfo"><strong>',
              '<h3>' + geo.properties.name + '</h3>',
              text,
              '</strong></div>'].join('');
    }
  },
  scope: 'europe',
  setProjection: function(element, options) {
    var centerX = 12
    if (window.matchMedia("(max-width: 800px)").matches) {
      centerX = 0
    }

    var projection = d3.geo.albers()
                       .center([centerX, 52])
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

function updateInfoMentions(data) {
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
    var mentions = 'mentions: ' + data[i].mentions
    obj[data[i].country] = {text: mentions, fillColor: color}
    colors.push(color)
  }
  map.updateChoropleth(obj);
  generateScaleLegend(paletteScale, "Podcast Mentions", "Counts for mentions on the podcast by country. Mentions of the EU in general don't count towards anyone");
}

function updateInfoNone(data) {
  window.data = data;

  for(var i=0; i < data.length; i++){
    var obj = {};
    obj[data[i].country] = {text: -1, fillColor: 'grey'};
    map.updateChoropleth(obj);
    removeLegend();
  }
}

function updateInfoPolitical(data) {
  window.data = data;
  var obj = {};

  var colors = {
    'S&D': '#ff0000',
    'EPP': '#4089c3',
    'ECR': '#0054a6',
    'ALDE': '#e6007e',
  }

  for(var i=0; i < data.length; i++){
    var mainParty = data[i].party.split(',')[0]
    color = colors[mainParty] || 'grey'
    obj[data[i].country] = {text: data[i].party, fillColor: color}
  }
  map.updateChoropleth(obj);
  removeLegend()
}

function updateInfoMembership(data) {
  window.data = data;
  var obj = {};

  var colors = {
    'TRUE': '#009',
    'FALSE': 'grey'
  }

  for(var i=0; i < data.length; i++){
    var color = colors[data[i].EU] || 'grey'
    let text
    if (data[i].EU === 'TRUE'){
      text = 'EU Member'
    } else {
      text = ''
    }
    obj[data[i].country] = {text: text, fillColor: color}
  }
  map.updateChoropleth(obj);
  removeLegend()
}

function switchData(state) {
  if (state === 'mentions') {
    updateInfoMentions(window.data)
  } else if (state === 'affiliations') {
    updateInfoPolitical(window.data)
  } else if (state === 'membership') {
    updateInfoMembership(window.data)
  } else {
    updateInfoNone(window.data)
  }
}


function textLegend(blurb) {
  var blurbSpace = document.getElementById('legend-text')
  blurbSpace.innerHTML = blurb
}

function removeLegend() {
  var svg = d3.select("#legend")
  textLegend('')
  svg.selectAll("*").remove()
  document.getElementById('legend').style.height = '0px';
}

function generateScaleLegend(scale, title, blurb = '') {
  document.getElementById('legend').style.height = 'auto';
  var svg = d3.select("#legend")

  svg.append("g")
              .attr("class", "legendLinear")
              .attr("transform", "translate(20,20)")

  var legendLinear = d3.legend.color()
                       .shapeWidth(30)
                       .cells(10)
                       .orient('horizontal')
                       .labelFormat(d3.format(".0f"))
                       .scale(scale)
                       .title(title)

  svg.select(".legendLinear")
                       .call(legendLinear)
  textLegend(blurb)
}

window.addEventListener('DOMContentLoaded', init)
