google.charts.load('current', {packages: ['corechart', 'line']});
google.charts.setOnLoadCallback(drawChart);

var stock;
var time;
var allData = new Array();
var intervalMode = false; //true only if integral is not the whole chart
var percentChange = null;
var cx = '001725181769903031181:a_rhctpgo-y';
var chart;
var stocks=["AAPL","AMZN","GOOG","beiojfaiowefjioejfiojswefoijsaeofijoisjioefjs"];

function getStockJSON(stock, time) {
  console.log(stock)
  console.log(time)
  var xml = new XMLHttpRequest();
  var url = "https://api.iextrading.com/1.0/stock/" + stock + "/chart/" + time + "/?chartInterval=1";
  
  xml.onreadystatechange = function() {
    if (this.readyState == XMLHttpRequest.DONE) {
      allData = JSON.parse(this.responseText);
    }
  }
  xml.open("GET", url, false);
  xml.send();
}

function getStockList() {
  var xml = new XMLHttpRequest();
  var url = "https://api.iextrading.com/1.0/ref-data/symbols"

  var stockList = new Array();
  
  xml.onreadystatechange = function() {
    if (this.readyState == XMLHttpRequest.DONE) {
      stockList = JSON.parse(this.responseText);

      stockSelect = document.getElementById("stock");

      for(i in stockList) {
        if(stockList[i].isEnabled){
          var option = document.createElement("option");
          option.text = stockList[i].symbol + " - " + stockList[i].name;
          option.setAttribute("ticker",stockList[i].symbol);
          stockSelect.add(option);
        }
      } 

    }
  }

  xml.open("GET", url, false);
  xml.send();
}

function drawChart() {
  var data = new google.visualization.DataTable();
  if(time == '1d') {
    data.addColumn('')
  }
  data.addColumn('date', 'X');
  data.addColumn('number', 'Price');
  data.addColumn('number', 'Price');
  
  getStockJSON(stock,time);

  var bound1 = 0, bound2 = allData.length-1;

  if(intervalMode) {
    var selection = chart.getSelection();
    bound1 = selection[0].row;
    bound2 = selection[1].row;
  }

  for(i in allData) {
    date = new Date(allData[i].date);
    date = new Date(date.valueOf() + date.getTimezoneOffset() * 60000); //standardize based on time zone
    if(true) {

      if((i > bound1 && i < bound2 )|| (i < bound1 && i > bound2 )) {
        data.addRows([[date, null, allData[i].close]]);
      } else if (i == bound1 || i == bound2) {
        data.addRows([[date, allData[i].close, allData[i].close]]);
      } else {
        data.addRows([[date, allData[i].close, null]]);
      }
    }
  }

  if (bound1 < bound2) {
    percentChange = (allData[bound2].close-allData[bound1].close)/allData[bound1].close*100;
  } else {
    percentChange = (allData[bound1].close-allData[bound2].close)/allData[bound2].close*100;
  }

  var graphColor = "#ffffff"; //graph outside of interval
  if (percentChange < 0) {
    intervalColor = "rgb(200,0,0)";
  } else {
    intervalColor = "#00aa00";
  }
  
  var options = {
    axisTitlesPosition: 'none',
    backgroundColor: '#101010',
    selectionMode: 'multiple',
    legend: {
      position: 'none'
    },
    hAxis:{
      textStyle: {
        color: '#cccccc'
      },
      gridlines: {
        color: '#333'
      }
    },
    vAxis:{
      textStyle: {
        color: '#cccccc'
      },
      gridlines: {
        color: '#777'
      }
    },
    colors: [graphColor,intervalColor],
    series: {
      0: { 
        lineWidth: 1,
        areaOpacity: 0.0
      },
      1: { lineWidth: 2 },
    },
  };
  chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
  //google.visualization.events.addListener(chart, 'click', clickHandler);
  google.visualization.events.addListener(chart, 'select', selectionHandler);
  chart.draw(data, options);
}

function selectionHandler() {
  //set max selection amount to 2
  var selectedIndices = chart.getSelection();
  if (selectedIndices.length == 3) {
    chart.setSelection(selectedIndices.slice(1,selectedIndices.length));
  }

  if(chart.getSelection().length == 2) {
    intervalMode = true;
    drawChart();
  } else if(chart.getSelection().length == 1) {
    refreshNews(allData[chart.getSelection()[0].row].date);
  }
}

function refreshNews(date) {
  console.log(date);
  console.log(toJulian(date));
  document.getElementById("gsc-i-id1").value = document.getElementById("stock").options[document.getElementById("stock").selectedIndex].label + " stock news " + date;
  document.getElementsByClassName("gsc-search-button")[1].click();
  $('#news').scrollTop($('.gsc-adBlock').first().height());
}

function toJulian(date) {
  d = new Date(date);
  days = d.getTime()/(1000*60*60*24);
  return Math.floor((days)+2440587.5);
}

document.addEventListener('DOMContentLoaded', (event) => {

  
  timeSelect = document.getElementById("timeframe");

  time = timeSelect.options[timeSelect.selectedIndex].getAttribute('time');


  timeSelect.addEventListener("change", (event) => {
    intervalMode = false;
    time = timeSelect.options[timeSelect.selectedIndex].getAttribute('time');
    drawChart();
  });

});

$(document).ready(function(){
  $("#stock").select2({});
  getStockList();
  stock = "A";
  $('#stock').change(function () {
    console.log($('#stock').val())
    stock = $('option:selected', this).attr("ticker");
    console.log(stock)
    drawChart();
  });
})
