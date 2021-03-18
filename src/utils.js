import {select, selectAll} from '../node_modules/d3-selection';
import {barChart, barChartData} from './app';
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
  // in case user removes out of order
  if (barChartData.length == 1 && index > 1) {
    if (index == 2) {
      barChartData.splice(index - 2, 1);
    } else {
      barChartData.splice(index - 3, 1);
    }
  } else {
    barChartData.splice(index - 1, 1);
  }

  // Re-render bar charts without the data
  barChart(barChartData, 'DonorAdvisedFundsHeldCnt', '#accounts');
  barChart(barChartData, 'DonorAdvisedFundsGrantsCnt', '#granted');
  barChart(barChartData, 'DonorAdvisedFundsContriCnt', '#contributed');
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
  numHeld.innerText = data.DonorAdvisedFundsHeldCnt + " Accounts Sponsored"
  deposits.innerText = "$ " + data.DonorAdvisedFundsContriAmt + " Deposited"
  grants.innerText = "$ " + data.DonorAdvisedFundsGrantsAmt + " Granted"

  element.appendChild(name);
  element.appendChild(ein);
  element.appendChild(numHeld);
  element.appendChild(deposits);
  element.appendChild(grants);

  // Clear selection from Dropdown, if any
  var dropdownSelect = document.getElementById("dropdown");
  dropdownSelect.firstChild.selectedIndex = "0";

  icon.addEventListener('click', function () {deleteSelection(index) });

}

// export function enableSearch() {
//   const searchBtn = document.getElementById("searchBtn");
//   searchBtn.addEventListener('click', searchDafOnMap);
// }

// export function searchDafOnMap() {
//   const searchText = document.getElementById("searchdaf");
//   const searchValue = searchText.value;
//   searchText.innerText = '';
  
//   const foundDaf = selectAll("circle")
//                   .filter(function(d) { return d.EIN === 417});
//   console.log(foundDaf);

//   foundDaf.style("fill","orange");
// }


export function updateData(data) {
  const name = data['Name'];
  return Object.entries(data)
    // Don't keep any of the values in this list
    .filter(d => ['EIN','Name','Longitude','Latitude'].indexOf(d[0]) < 0)
    .map(
      function(row) {
        var d = {'Type' : nameChange(row[0]),
                  [name] : row[1]
                };
        return d;
      }, []
    );
}

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