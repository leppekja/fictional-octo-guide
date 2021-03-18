import {prepData, infoModal, deleteSelection, updateData, updateData2} from './utils';
import {select, selectAll} from '../node_modules/d3-selection';
import {axisLeft, axisBottom} from '../node_modules/d3-axis';
import {csv, json, geoEqualEarth, geoPath, geoIdentity, 
    geoAlbersUsa, zoom, zoomIdentity, zoomTransform, pointer,
    area, stack, stackOffsetExpand, max, range, domain} from '../node_modules/d3';
import * as topojson from '../node_modules/topojson-client';
import {scaleLinear, scaleBand, scaleOrdinal} from '../node_modules/d3-scale';
import * as d3 from '../node_modules/d3';
import * as dc3 from '../node_modules/d3-hierarchy';
import './main.css';

// Resources Consulted 
// https://observablehq.com/@mbostock/u-s-airports-voronoi - Fill / stroke for background map
// https://gist.github.com/michellechandra/0b2ce4923dc9b5809922 - AlbersUSA projection
// https://medium.com/@louisemoxy/a-simple-way-to-make-d3-js-charts-svgs-responsive-7afb04bc2e4b - responsive design
// https://stackoverflow.com/questions/20987535/plotting-points-on-a-map-with-d3 - transform lat/long points to projection

// fetch('https://vega.github.io/vega-datasets/data/us-10m.json')
//   .then(response => response.json())
//   .then(data => myVis(data))
//   .catch(e => {
//     console.log(e);
//   });
// csv('../data/TestGeocodeToJson.csv')
//     .then(data => {
//         myVis(data);
//       });

// json('https://vega.github.io/vega-datasets/data/us-10m.json')
//     .then(data => backgroundMap(data));

/* 
This is a global variable used to keep track of what data is being
used in the info popups, and sent to dynamically update the bar chart. 
*/

export var barChartData  = [];


json('https://vega.github.io/vega-datasets/data/us-10m.json')
  .then(data => combined(data))
  .then(initializeBars());

function combined(data) {
  var projection = geoAlbersUsa();
  const states = topojson.feature(data, data.objects.states).features;
  var svg = document.getElementById("mappoints")

  // const zoom = zoom()
  //   .scaleExtent([1, 8])
  //   .on("zoom", zoomed);
const margin ={top: 0, bottom: 0, right: 0, left: 150};

const svgContainer = select('#mapviz')
                        .append('div')
                        .attr('class','chart-container')
                        .style('position', 'relative')
                        .style('overflow-x', 'hidden')
                        .style('width','100%');

var svg = svgContainer
  .append('svg')
  .attr('id', 'mappoints')
  // .attr('height', '400px')
  // .attr('width','400px')
  .attr("viewBox", [0, 0, 1100, 500])
  // .on("click", reset)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append('g')
    .attr("id","states")
    .selectAll('path')
    .data(states)
    .join('path')
    .attr('d', geoPath().projection(projection))
    .attr('fill','gray');
    // .on("click", clicked);

  svg.append("path")
    .datum(topojson.mesh(data, data.objects.states, (a, b) => a !== b))
    .attr("fill", "none")
    .attr("stroke", "lightgray")
    .attr("d", geoPath().projection(projection));

    // svg.call(zoom);

  csv('https://github.com/leppekja/fictional-octo-guide/blob/main/data/TestGeocodeToJson.csv')
    .then(points => {
      
      const points_margin ={top: -40, bottom: 0, right: 0, left: 100};
      // DROPDOWN
      var selecter = select("#dropdown")
        .append("select")
        .attr("id","DAFnames")
        .on("change", function() {
          var dafData = points[this.value];

          if(this.value > 1) {
            // infoModal(dafData);
            renderSupplement(dafData);
          }
        });

      selecter.append("option")
        .html("Select DAF Sponsor:")
        

      var options = selecter.selectAll("null")
        .data(points)
        .enter()
        .append("option")
        .attr("value", function(d, i) { return i;})
        .text(d => d.Name);

      svg.append('g')
      .selectAll('circle')
      .data(points)
      .join('circle')
      .attr('r', 3)
      .attr('transform', function(d) {
        const [cx, cy] =  projection([
          d.Longitude,
          d.Latitude
        ]);
        return `translate(${cx}, ${cy})`;
      })
      .attr('fill','#003f5c')
      .on('click', d => renderSupplement(d.target.__data__))
      // infoModal(d.target.__data__);

      .on('mouseenter', (e, d) => {
        tooltip
              .style('display','block')
              .style('left', `${e.offsetX}px`)
              .style('top', `${e.offsetY - 20}px`)
              .text(d.EIN);
        
      })
      .on('mouseleave', (e, d) =>
        tooltip.style('display', 'none'));


      const tooltip = svgContainer.append('div')
                        .attr('id','tooltip')
                        .style('display','none');

  });
}

/*
function myVis(data) {
  const margin ={top: 0, bottom: 0, right: 0, left:100};
  
  var svg = select('#mapviz')
  .append('svg')
  .attr('id','mappoints')
  .attr("viewBox", [0, 0, 1000, 600])
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // var svg = select('#mappoints')
  //   .attr("viewBox", [0, 0, 1000, 600])
  //   .append("g")
  //   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var projection = geoAlbersUsa();

  svg.append('g')
  .selectAll('circle')
  .data(data)
  .join('circle')
  .attr('cx', d => d.Longitude)
  .attr('cy', d => d.Latitude)
  .attr('r', 3)
  .attr('transform', function(d) {
    return "translate(" + projection([
      d.Longitude,
      d.Latitude
    ]) + ")"
  })
  .attr('d', geoPath().projection(geoAlbersUsa()))
  .attr('fill','#003f5c');

}


function backgroundMap(statesJSON) {

  const margin ={top: 50, bottom: 0, right: 0, left: 0};

  const data = topojson.feature(statesJSON, statesJSON.objects.states).features;

  // var svg = select('#mapviz')
  //             .append('svg')
  //             .attr('id', 'mappoints')
  //             .attr("viewBox", [0, 0, 900, 500])
  //             .append("g")
  //             .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var svg = select('#mappoints')
              // .attr("viewBox", [0, 0, 1000, 600])
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append('g')
        .selectAll('path')
        .data(data)
        .join('path')
        .attr('d', geoPath().projection(geoAlbersUsa()))
        .attr('fill','gray')
        // .attr("fill-opacity", .9)
        .attr('stroke','gray');

  svg.append("path")
      .datum(topojson.mesh(statesJSON, statesJSON.objects.states, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("stroke", "lightgray")
      .attr("d", geoPath().projection(geoAlbersUsa()))
}

*/

function updateMapColors(data) {

  csv("../data/teststatevalues.csv")
  .then(data => {

  var colorMap = scaleLinear()
            .domain([0, 100])
            .range(["white","black"])
            .interpolate(d3.interpolateHcl);
  select("#states")
    .selectAll("path").transition().duration(1000)
    .attr("fill", d => colorMap(data[0][d.id]));
    // .attr("fill", "blue");
  });
}



// function displayGrantees(ein_filter) {
//   var projection = geoAlbersUsa();
//   const points_margin ={top: -30, bottom: 0, right: 0, left: 100};

//   csv('../data/SVCFGeocodeResults.csv')
//     .then(data => {

//       svg.append('g')
//       .attr("transform", "translate(" + points_margin.left + "," + points_margin.top + ")")
//       .selectAll('circle')
//       .data(points)
//       .join('circle')
//       .attr('cx', d => d.Longitude)
//       .attr('cy', d => d.Latitude)
//       .attr('r', 3)
//       .attr('transform', function(d) {
//         return "translate(" + projection([
//           d.Longitude,
//           d.Latitude
//         ]) + ")"
//       })
//       .attr('d', geoPath().projection(projection))
//       .attr('fill','#003f5c')
//       .on('click', d => infoPopUp());
//   });
// }


// function reset() {
//   states.transition().style("fill", null);
//   svg.transition().duration(750).call(
//     zoom.transform,
//     zoomIdentity,
//     zoomTransform(svg.node()).invert([width / 2, height / 2])
//   );
// }

// function clicked(event, d) {
//   const [[x0, y0], [x1, y1]] = path.bounds(d);
//   event.stopPropagation();
//   states.transition().style("fill", null);
//   select(this).transition().style("fill", "red");
//   svg.transition().duration(750).call(
//     zoom.transform,
//     zoomIdentity
//       .translate(width / 2, height / 2)
//       .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
//       .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
//     pointer(event, svg.node())
//   );
// }

// function zoomed(event) {
//   const {transform} = event;
//   g.attr("transform", transform);
//   g.attr("stroke-width", 1 / transform.k);
// }



// STACKED AREA CHART CODE

// csv('../data/TestGeocodeToJson.csv')
//   .then(response => renderBarChart(response));



function renderSupplement(data) {
  var index_used = infoModal(data);
  data['index'] = index_used;
  if (index_used == 1) {
    barChartData.unshift(data)
  } else if (index_used == 2) {
      barChartData.splice(1, 0, data)
  } else if (index_used == 3) {
    barChartData.push(data);
  }
  updateMapColors(data);
  console.log(barChartData);
  barChart(barChartData, 'DonorAdvisedFundsHeldCnt', '#accounts');
  barChart(barChartData, 'DonorAdvisedFundsGrantsCnt', '#granted');
  barChart(barChartData, 'DonorAdvisedFundsContriCnt', '#contributed');
  // console.log(Object.entries(data).reduce((acc, row) => {acc = acc + Number(row.DonorAdvisedFundsHeldCnt); return acc;}, 0));
}

function initializeBars() {
  const margin ={top: 5, bottom: 5, right: 20, left: 10};
  const height = 200;
  const width = 300;  
  const plotHeight = height - margin.top - margin.bottom;
  const plotWidth = width - margin.left - margin.right;

  const accounts = select("#bar1")
        .append("svg")
        .attr("id","accounts")
        .attr("viewBox", [0,0, plotWidth, plotHeight])
        .attr("transform", "translate(" + 
                        margin.left + "," + margin.top + ")")
        .append("g")
        .attr("id","info");
  
  const granted = select("#bar2")
        .append("svg")
        .attr("id","granted")
        .attr("viewBox", [0,0, plotWidth, plotHeight])
        .attr("transform", "translate(" + 
                        margin.left + "," + margin.top + ")")
        .append("g")
        .attr("id","info");

  const contributed = select("#bar3")
        .append("svg")
        .attr("id","contributed")
        .attr("viewBox", [0,0, plotWidth, plotHeight])
        .attr("transform", "translate(" + 
                        margin.left + "," + margin.top + ")")
        .append("g")
        .attr("id","info");

  accounts.append("text")
          .attr("x", 50)
          .attr("y", 5)
          .attr("dy", "0.35em")
          .attr("font-size", '10px')
          .text("Number of Accounts Held")

  granted.append("text")
          .attr("x", 50)
          .attr("y", 5)
          .attr("dy", "0.35em")
          .attr("font-size", '10px')
          .text("Amount Granted ($)")

  contributed.append("text")
          .attr("x", 50)
          .attr("y", 5)
          .attr("dy", "0.35em")
          .attr("font-size", '10px')
          .text("Amount Deposited ($)")
  
}

export function barChart(data, yData, svgId) {
  const margin ={top: 5, bottom: 5, right: 20, left: 10};
  const height = 200;
  const width = 300;  
  const plotHeight = height - margin.top - margin.bottom;
  const plotWidth = width - margin.left - margin.right;
  var yDim = yData
  var svg = select(svgId);

  var xScale =scaleBand()
  .domain(d3.range(data.length))
  .range([0, plotWidth])
  .padding(0.3);

  var yScale = scaleLinear()
    .domain([0, 800])
    .range([0, plotHeight]);

  var color = scaleOrdinal()
    .range(["#003f5c","#cd853f","#555555"])

  svg.selectAll("rect")
      .data(data, d => d.EIN)
      .join(
        enter => enter.append("rect")
              .attr("x", (d, i) => xScale(i))
              .attr("y", d => plotHeight - yScale(d[yDim]))
              .attr("width", xScale.bandwidth())
              .attr("height",d => yScale(d[yDim])),
        update => update.call(el => el)              
          .attr("x", (d, i) => xScale(i))
          .attr("y", d => plotHeight - yScale(d[yDim]))
          .attr("width", xScale.bandwidth())
          .attr("height",d => yScale(d[yDim])),
        exit => exit.remove()
      )
      .attr("fill", d => color(d.index))
      // .on('mouseenter', (e, d) => {
      //   tooltip
      //         .style('display','block')
      //         .style('left', `${e.offsetX}px`)
      //         .style('top', `${e.offsetY}px`)
      //         .text(d.EIN);
        
      // })
      // .on('mouseleave', (e, d) =>
      //   tooltip.style('display', 'block'));

      //   const tooltip = svg.append('div')
      //                   .attr('id','tooltip')
      //                   .style('display','block');

  // svg.append('g')
  //       .attr('font-size', 12)
  //       .attr('fill', "white")
  //       .selectAll('text')
  //       .data(data, d => d.EIN)
  //       .join(
  //         enter => enter.append("text")
  //         .attr("x", (d, i) => xScale(i))
  //         .attr("y", d => plotHeight - yScale(d[yDim]))
  //         .attr("dy", -4),
  //         update => update.call(el => el)
  //         .attr("x", (d, i) => xScale(i))
  //         .attr("y", d => plotHeight - yScale(d[yDim]))
  //         .attr("dy", "-.4em"),
  //         exit => exit.remove()
  //       )
  //       .text(d => d.EIN)

  svg.append('g').call(axisLeft(yScale.range([plotHeight, 0])))
      .attr('class','y-axis')
      .attr('transform',`translate(35, 0)`)
      .style('font-size', '9px');

  // var legend = svg => {
  //     const g = svg
  //     .attr("transform", `translate(30, 0)`)
  //     .attr("text-anchor","end")
  //     .selectAll("g")
  //     .data(color.domain().slice())
  //     .join("g")
  //     .attr("transform", (d, i) => `translate(${i * 90}, 20)`);

  // g.append("rect")
  //   .attr("x", -19)
  //   .attr("width",15)
  //   .attr("height", 15)
  //   .attr("fill", color);

  // g.append("text")
  //   .attr("x", -24)
  //   .attr("y", 9.5)
  //   .attr("dy", "0.35em")
  //   .attr(d => d.Name);
  // }

  // svg.append("g")
  //   .call(legend);

}
      

// function updateBarChart(test, svg) {
//   const margin ={top: 20, bottom: 20, right: 20, left: 10};
//   const height = 300;
//   const width = 300;  
//   const plotHeight = height - margin.top - margin.bottom;
//   const plotWidth = width - margin.left - margin.right;

//   const second = [{ "Type": "# of Accounts", "a": "330", "b": "330"},
//                 { "Type": "$ Deposited", "a": "330", "b": "330"},
//                 { "Type": "$ Granted", "a": "330", "b": "330"}]

//   const groupBy = "Type";
//   const valuesToPlot = Object.keys(test[0]).slice(1);

//   var xGroupByScale = scaleBand()
//   .domain(test.map(d => d[groupBy]))
//   .rangeRound([margin.left, width-margin.right])
//   .paddingInner(0.1);

// var xValuesToPlotScale =scaleBand()
//   .domain(valuesToPlot)
//   .range([0, xGroupByScale.bandwidth()])
//   .padding(0.05);

// var yScale = scaleLinear()
//   .domain([0, 603])
//   .range([0, plotHeight]);

// var color = scaleOrdinal()
//   .range(["#98abc5", "#8a89a6"])

// const barContainer = svg.append('g').attr('class', 'bar-container')

//   barContainer.append("g")
//       .selectAll("g")
//       .data(test)
//       .join("g")
//         .attr("transform", test=> `translate(${xGroupByScale(test[groupBy])}, 0)`)
//       .selectAll("rect")
//       .data(test => valuesToPlot.map(key => ({key, value: test[key]})))
//       .join(
//         enter => enter.append("rect").attr("x", test => xValuesToPlotScale(test.key))
//                                       .attr("y", test => plotHeight - yScale(test.value)),
//         update => update.attr("x", test => xValuesToPlotScale(test.key))
//                         .attr("y", test => plotHeight - yScale(test.value)),
//         remove => remove.remove())
//     //  .attr("x", test => xValuesToPlotScale(test.key))
//     //  .attr("y", test => plotHeight - yScale(test.value))
//       .attr("width", xValuesToPlotScale.bandwidth())
//       .attr("height", test => yScale((test.value)))
//       .attr("fill", d => color(d.key));

//   svg.append('g').call(axisBottom(xGroupByScale))
//       .attr('class','x-axis')
//       .attr('transform',`translate(0, ${plotHeight})`)
//       .style('font-size', '9px');
//       // .attr('transform','rotate(-65)');

//   var legend = svg => {
//     const g = svg
//     .attr("transform", `translate(${width / 2}, 0)`)
//     .attr("text-anchor","end")
//     .selectAll("g")
//     .data(color.domain().slice().reverse())
//     .join("g")
//     .attr("transform", (d, i) => `translate(0, ${i * 20})`);

//   g.append("rect")
//     .attr("x", -19)
//     .attr("width",19)
//     .attr("height", 19)
//     .attr("fill", color);

//   g.append("text")
//     .attr("x", -24)
//     .attr("y", 9.5)
//     .attr("dy", "0.35em")
//     .attr(d => d);
//   }
//   svg.append("g")
//     .call(legend);
  
// }


// function biLink(root) {
//   const map = new Map(root.leaves().map(d => [id]))
// }

// const tree = dc3.cluster()
//     .size([2 * Math.PI, 500])
  

// d3.csv('./data/d2dtest.csv')
//   .then(response => response)
//   .then(data => console.log(data))

  // json('./data/daf2daf.json')
//   .then(response => JSON.parse(response))
//   .then(data => {
//     const root = tree(dc3.hierarchy(data), d => d)

//     console.log(root);

//     const svg = select("#test")
//       .append("svg")
//       .attr('width', 800)
//       .attr('height', 800)

//     svg.append("g")
//       .attr("font-family", "sans-serif")
//       .attr("font-size", 10)
//         .selectAll("g")
//         .data(data.map(d =>))
//         .join("g")
//           .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
//         .append("text")
//           .attr("dy", "0.31em")
//           .attr("x", d => d.x < Math.PI ? 6 : -6)
//           .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
//           .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
//           .text(d => d.data.Name)
//           .each(function(d) { d.text = this; })
    
//   });

