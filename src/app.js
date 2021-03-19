import {prepData, infoModal, deleteSelection} from './utils';
import {select, selectAll} from '../node_modules/d3-selection';
import {axisLeft, axisBottom} from '../node_modules/d3-axis';
import {csv, json, geoEqualEarth, geoPath, geoIdentity, 
    geoAlbersUsa, zoom, zoomIdentity, zoomTransform, pointer,
    area, stack, stackOffsetExpand, max, range, domain} from '../node_modules/d3';
import * as topojson from '../node_modules/topojson-client';
import {scaleLinear, scaleBand, scaleOrdinal} from '../node_modules/d3-scale';
import * as d3 from '../node_modules/d3';
import {sankey, sankeyLinkHorizontal} from '../node_modules/d3-sankey';
import * as dc3 from '../node_modules/d3-hierarchy';
import './main.css';

// Key Resources Consulted 
// D3 Documentation on Observable / Github
// https://medium.com/@louisemoxy/a-simple-way-to-make-d3-js-charts-svgs-responsive-7afb04bc2e4b - responsive design
// https://observablehq.com/@d3/parallel-sets
/* 
This is a global variable used to keep track of what data is being
used in the info popups, and sent to dynamically update the bar chart. 
We start with sample data.
*/

export var barChartData  = [undefined, undefined, undefined];

// Read in the Sponsoring Organizations data for the dropdown menu
// And to populate the info boxes and the bar charts

csv('./data/SponsorsViz.csv')
  .then(dafs => {
    // DROPDOWN
    var selecter = select("#dropdown")
      .append("select")
      .attr("id","DAFnames")
      .on("change", function() {
        var dafData = dafs[this.value];
        if(this.value > 1) {
          renderSupplement(dafData);
        }
      });

    selecter.append("option")
      .html("Select DAF Sponsor:");
      
    var options = selecter.selectAll("null")
      .data(dafs)
      .enter()
      .append("option")
      .attr("value", function(d, i) { return i;})
      .text(d => d.Name);
  })
    .then(initializeBars())
    .then(renderSupplement({
      "EIN": "416029402",
      "Name": "THE MINNEAPOLIS FOUNDATION",
      "DonorAdvisedFundsHeldCnt": "821",
      "DonorAdvisedFundsContriAmt": "89488164",
      "DonorAdvisedFundsGrantsAmt": "48722649",
      "index": 0
    }));

// The functions to render the supplements
// Calls all the functions when data changes
// Called from above and in utils.js

function renderSupplement(data) {
  var index_used = infoModal(data);
  data['index'] = index_used;
  barChartData[index_used] = data;
  // Delete the old Sankey chart
  // Will switch this to the D3 update cycle over spring break
  document.getElementById("mapviz").innerHTML = '';
  updateSankey(barChartData.map(d => d ? d.EIN : 0));
  barChart(barChartData, 'DonorAdvisedFundsHeldCnt', '#accounts', "Number of Accounts Held");
  barChart(barChartData, 'DonorAdvisedFundsGrantsAmt', '#granted',"Amount Granted ($)");
  barChart(barChartData, 'DonorAdvisedFundsContriAmt', '#contributed', "Amount Deposited ($)");
}

// Initializes the bar charts

function initializeBars() {
  const margin ={top: 10, bottom: 10, right: 10, left: 10};
  const height = 350;
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

// Updates the bar charts

export function barChart(data, yData, svgId, title) {
  const margin ={top: 10, bottom: 10, right: 10, left: 10};
  const height = 350;
  const width = 300;  
  const plotHeight = height - margin.top - margin.bottom;
  const plotWidth = width - margin.left - margin.right;
  var yDim = yData
  var svg = select(svgId);

  svg.append("text")
  .attr("x", 50)
  .attr("y", 5)
  .attr("dy", "0.35em")
  .attr("font-size", '10px')
  .text(title)


  var xScale =scaleBand()
  .domain(d3.range(data.length))
  .range([0, plotWidth])
  .padding(0.3);


  var yScale = scaleLinear()
    .domain([0, Math.max(...data.map(d => d ? Number(d[yDim]) : 0))])
    .range([0, plotHeight])
  
  var yTicks = yScale.ticks().filter(tick => Number.isInteger(tick));
  const color = ["#cd853f","#555555","#cd853f","#003f5c"];

  svg.selectAll("rect")
      .data(data)
      .join(
        enter => enter.append("rect")
              .attr("x", (d, i) => xScale(i))
              .attr("y", d => d ? plotHeight - yScale(d[yDim]) : 0)
              .attr("width", xScale.bandwidth())
              .attr("height",d => d ? yScale(d[yDim]) : 0)
              .attr("fill", (d, idx) => color[idx]),
        update => update.call(el => el)              
          .attr("x", (d, i) => xScale(i))
          .attr("y", d => d ? plotHeight - yScale(d[yDim]) : 0)
          .attr("width", xScale.bandwidth())
          .attr("height",d => d ? yScale(d[yDim]) : 0)
          .attr("fill", (d, idx) => color[idx])
          ,
        exit => exit.remove()
      )

  svg.select('g').call(axisLeft(yScale.range([plotHeight, 0])).tickFormat(d3.format(".2s")).tickValues(yTicks))
      .attr('class','y-axis')
      .attr('transform',`translate(35, 0)`)
      .style('font-size', '9px');

}

// Main Sankey Diagram code
// Obtain the data

export function updateSankey(eins) {
  csv('./data/check.csv')
    .then(data => data.filter(row => eins.indexOf(row.sponsor) >= 0))
    .then(filtered_data => mainDiagram(filtered_data, eins))
}

// Draw diagram
// Adapted from Mike Bostock Example on Observable
// https://observablehq.com/@d3/parallel-sets

export function mainDiagram(data, eins) {
  console.log(data);
  const margin ={top: 5, bottom: 0, right: 10, left: 0};
  const width =  1000;
  const height = 550;

  const keys = ["sponsor","state"]
  var graphData = graph(data, keys);

  const color = scaleOrdinal()
            .domain(eins)
            .range(["#003f5c","#bdbdbd","#cd853f"]);

  const sankeyParams = sankey()
    .nodeSort(null)
    .linkSort(null)
    .nodeWidth(4)
    .nodePadding(20)
    .extent([[0, 5], [width, height - 20]])

  const svg = select("#mapviz")
                .append("svg")
                // .attr("width", width)
                // .attr("height", height)
                .attr("transform", "translate(" + 
                    margin.left + "," + margin.top + ")")
                .attr("viewBox", [0,0, width, height + 10]);

  const {nodes, links} = sankeyParams({
    nodes: graphData.nodes.map(d => Object.assign({}, d)),
    links: graphData.links.map(d => Object.assign({}, d))
  });

  console.log(nodes, links);

  svg.append("g")
    .selectAll("rect")
    .data(nodes)
    .join("rect")
      .attr("x", d => d.x0)
      .attr("y", d=> d.y1 - 5)
      .attr("height", d=> 10)
      .attr("width", d=> d.x1 - d.x0)
      .attr("transform", "translate(0," + margin.top + ")")
    .append("title")
      .text(d => `${d.name}\n${d.value.toLocaleString()}`);

  svg.append("g")
    .attr("fill", "none")
    .selectAll("g")
    .data(links)
    .join("path")
    .attr("d", sankeyLinkHorizontal())
    .attr("stroke", d => color(d.names[0]))
    .attr("stroke-width", d => Number(d.value) / 900000 )
    .attr("transform", "translate(0," + margin.top + ")")
    .style("mix-blend-mode","multiply")

  svg.append("g")
      .style("font", "10px sans-serif")
    .selectAll("text")
    .data(nodes)
    .join("text")
      .attr("id","text")
      .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr("y", d => d.x0 < width / 2 ? (d.y1 + d.y0) / 2 + 10 : (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
      .text(d => d.name)
      .attr("transform", "translate(0," + margin.top + ")")
      // Having trouble changing the color of the labels to have a background. 
      // .attr('display','block')
      // .style('fill','white')
      // .style('background-color','#646464')
    .append("tspan")
      .attr("fill-opacity", 0.7)
      .text(d => ` ${"$" + d.value.toLocaleString()}`);
}

// Helper function to transform the data to the graph / links modal.
// ALL Credit to Mike Bostock
// https://observablehq.com/@d3/parallel-sets

export function graph(data, keys) {
  let index = -1;
  const nodes = [];
  const nodeByKey = new Map;
  const indexByKey = new Map;
  const links = [];

  for (const k of keys) {
    for (const d of data) {
      const key = JSON.stringify([k, d[k]]);
      if (nodeByKey.has(key)) continue;
      const node = {name: d[k]};
      nodes.push(node);
      nodeByKey.set(key, node);
      indexByKey.set(key, ++index);
    }
  }

  for (let i = 1; i < keys.length; ++i) {
    const a = keys[i - 1];
    const b = keys[i];
    const prefix = keys.slice(0, i + 1);
    const linkByKey = new Map;
    for (const d of data) {
      const names = prefix.map(k => d[k]);
      const key = JSON.stringify(names);
      const value = d.value || 1;
      let link = linkByKey.get(key);
      if (link) { link.value += value; continue; }
      link = {
        source: indexByKey.get(JSON.stringify([a, d[a]])),
        target: indexByKey.get(JSON.stringify([b, d[b]])),
        names,
        value
      };
      links.push(link);
      linkByKey.set(key, link);
    }
  }

  return {nodes, links};
}
