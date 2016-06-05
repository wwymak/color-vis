/**
 * Visualising the colors with bubbles
 */

d3.json('colorSOM.json', (err, data) => {
  var colorGroups = data.groups;
  console.log(colorGroups, Object.keys(colorGroups).length)
  let colorDataArr = [];
  for (let item in colorGroups) {
    let inputs = colorGroups[item].inputs;
    let colorArr = inputs.map(d => d.palette)
    let color = colorAvgerager(colorArr);
    let count = colorGroups[item].inputCount;
    let key = colorGroups[item].key;
    colorDataArr.push({color, count, key});
  }

  colorDataArr.sort((a, b) => b.count - a.count);
  
  console.log(colorDataArr);

  let width = 800;
  let height = 800;
  let damper = 0.1;
  let center = {x: 0.5 * width, y: 0.5 * height};
  let force = d3.layout.force().size([width, height])
      .charge(d => -Math.pow(d.radius, 2)/4)
      .friction(0.9)
      // .gravity(-0.01);
  let radiusScale = d3.scale.pow().exponent(0.5).range([1, 100]);

  let maxItems = d3.max(colorDataArr, d => d.count);
  radiusScale.domain([0, maxItems]);
  colorDataArr.forEach( d => {
    d.radius = radiusScale(d.count);
    d.x = Math.random() * width;
    d.y = Math.random() * height;
  });

  force.nodes(colorDataArr);

  let svg = d3.select("#bubbleVis").append('svg').attr({width, height});
  let dataBubbles = svg.selectAll('.node').data(colorDataArr, d => d.key);
  dataBubbles.enter().append('circle').attr('class', 'node')
      .attr('r',0)
      .style('fill', d => d.color)
      .on('click', (d) =>{
        // console.log(colorGroups[d.key])
        let idArr = Array.from(new Set(colorGroups[d.key].inputs.map(d => d.id)));
        console.log(idArr)
      });
  dataBubbles.transition()
      .duration(2000)
      .attr('r', d => d.radius);

  function moveToCenter(alpha) {

    return function (d) {
      d.x = d.x + (center.x - d.x) * damper * alpha;
      d.y = d.y + (center.y - d.y) * damper * alpha;
    };
  }

  force.on('tick', function (e) {
    dataBubbles.each(moveToCenter(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
  });

  force.start();



});

function colorAvgerager(rgbArr) {
  let avgR, avgG, avgB;
  avgR = d3.mean(rgbArr, d => d[0]);
  avgG = d3.mean(rgbArr, d => d[1]);
  avgB =d3.mean(rgbArr, d => d[2]);

  return d3.rgb(avgR, avgG, avgB);
}

// Group circles into a single blob.
function groupBubbles(force, nodes) {
  force.on('tick', function (e) {
    nodes.each(moveToCenter(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
  });

  force.start();
}



