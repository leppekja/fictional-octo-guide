import {select, selectAll} from '../node_modules/d3-selection';
import {barChart, barChartData, updateSankey} from './app';

export function infoModal(data) {
  var num_selected = 0;
  var index_used;

  for (let i =1; i <=3; i++) {
    var index = "daf" + i;
    var d = document.getElementById(index);

    if (d.firstElementChild.innerHTML == "None Selected") {
      writeDafDataToModal(d, index, data);
      index_used = i;
      break;
    } else {
      num_selected++;
    }
  };

  if (num_selected == 3) {
    alert("You've selected 3 already!");
  };

  return index_used;
}

export function deleteSelection(element) {
  var d = document.getElementById(element);
  d.innerHTML = '';

  var heading = document.createElement('h3');
  heading.innerText = "None Selected";

  d.appendChild(heading);

  // Remove data from bar Chart
  // https://stackoverflow.com/questions/10003683/how-can-i-extract-a-number-from-a-string-in-javascript
  var index = element.replace(/[^0-9]/g, '');

  console.log(barChartData);
  barChartData[index] = undefined;

  // Delete the old Sankey chart
  // Will switch this to the D3 update cycle over spring break
  document.getElementById("mapviz").innerHTML = '';
  updateSankey(barChartData.map(d => d ? d.EIN : 0));
  
  // Re-render bar charts without the data
  barChart(barChartData, 'DonorAdvisedFundsHeldCnt', '#accounts', "Number of Accounts Held");
  barChart(barChartData, 'DonorAdvisedFundsGrantsAmt', '#granted',"Amount Granted ($)");
  barChart(barChartData, 'DonorAdvisedFundsContriAmt', '#contributed', "Amount Deposited ($)");
}

function writeDafDataToModal(element, index, data) {
  element.innerHTML = '';

  var icon = document.createElement('i');
  icon.setAttribute('id','delete')
  icon.setAttribute('class', 'fa fa-minus-circle');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('display','inline');
  element.appendChild(icon);

  var name = document.createElement('h3');
  var ein = document.createElement('h5');
  var numHeld = document.createElement('h5');
  var deposits = document.createElement('h5');
  var grants = document.createElement('h5');
  
  name.innerText = data.Name;
  ein.innerText = "EIN: " + data.EIN;
  numHeld.innerText = data.DonorAdvisedFundsHeldCnt ? data.DonorAdvisedFundsHeldCnt + " Accounts Sponsored" : " 0 Accounts Sponsored"
  deposits.innerText = data.DonorAdvisedFundsContriAmt ? "$ " + data.DonorAdvisedFundsContriAmt + " Deposited" : "$0 Deposited"
  grants.innerText = data.DonorAdvisedFundsGrantsAmt ? "$ " + data.DonorAdvisedFundsGrantsAmt + " Granted" : "$0 Granted"

  element.appendChild(name);
  element.appendChild(ein);
  element.appendChild(numHeld);
  element.appendChild(deposits);
  element.appendChild(grants);

  // Clear selection from Dropdown, if any

    var dropdownSelect = document.getElementById("dropdown");
    if(dropdownSelect.firstChild) {
      dropdownSelect.firstChild.selectedIndex = "0";
    };

  icon.addEventListener('click', function () {deleteSelection(index) });

}

// Change how column names are displayed

function nameChange(d) {
  if (d === "DonorAdvisedFundsContriAmt") {
    return "$ Deposited";
  } else if (d === "DonorAdvisedFundsGrantsAmt") {
    return "$ Granted";
  } else if (d === "DonorAdvisedFundsHeldCnt") {
    return "# of Accounts";
  } else {
    return d;
  }
}


// Fix the parallel sets diagram y-values
// For some reason, the Sankey object provides incorrect y-values and no width

export function fixSankeyYVals(data, type) {
  var sourceStart = 0;
  var targetStart = 0;

  if (type == "nodes") {
    for (let i=0; i < data.length; i++) {
      if (data[i]['layer'] == 0) {
        data[i].y0 = sourceStart;
        sourceStart = data[i].y1;

      } else {
        data[i].y0 = targetStart;
        targetStart = data[i].y1;
      }
    }
    return data;
  } else if (type == "links") {

  }
}