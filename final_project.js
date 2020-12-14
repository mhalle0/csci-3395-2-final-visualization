// set dimensions and margins of the graph
margin = ({top: 100, right: 20, bottom: 70, left: 220});
var width  = document.getElementById('viz').clientWidth;
var height = width * 0.5; // This height doesn't show all the data

// Declare variables here to take them out of the data.csv function
var totalPlayed = [];
var purchaseCount = [];
var overallPlaytime = [];

// Test function for printing each object
function printEach(row)
{
  console.log(row);
}

var tip = d3.tip()
		.attr("class","d3-tip")
		.offset([-5,0])
		.html(function (d){
			properties = d.target.__data__;
			gameName = properties.Game;
			hrs = totalPlayed.find(elem => elem.Game == gameName).HoursPlayed;
			num = purchaseCount.find(elem => elem.Game == gameName).NumPurchased;
      totalHrs = overallPlaytime.find(elem => elem.Game == gameName).TotalHours;
				//console.log(d);
      if (Math.round(hrs) >= 1)
			     return `${gameName}</br>${Math.round(hrs)} hours played</br>${num} purchased
           </br>${Math.round(totalHrs)} total hours played`;
      else
           return `${gameName}</br> < 1 average hours played</br>${num} purchased
           </br> < 1 total hours played`;
    });

// Create and append svg
const svg = d3.select("#vizArea")
              .append("svg")
              .attr("width", width)
              .attr("height", height);
svg.call(tip);
// Get data
data = d3.csv("steam-200k-cleaned.csv")
            .then(function (data) {
              data.forEach(function (d) {
                d.HoursPlayed = +d.HoursPlayed;
              });
      // Filter data by average hours played and total copies purchased
       var holder = {};
       var count = {};
       var pCount = {};
       data.forEach(function(elem) {
         // Excludes all null elements
         if (elem.HoursPlayed != -1)
         {
           if (holder.hasOwnProperty(elem.Game))
           {
             holder[elem.Game] = holder[elem.Game] + elem.HoursPlayed;
             count[elem.Game] = count[elem.Game] + 1;
           }
           else
           {
              holder[elem.Game] = elem.HoursPlayed;
              count[elem.Game] = 1;
           }
         }

         if ((elem.Action).localeCompare("purchase"))
         {
           if (pCount.hasOwnProperty(elem.Game))
           {
             pCount[elem.Game] = pCount[elem.Game] + 1;
           }
           else
           {
              pCount[elem.Game] = 1;
           }
         }
       });
       for (var prop in holder)
       {
         totalPlayed.push({ Game: prop, HoursPlayed: holder[prop] / count[prop] });
         overallPlaytime.push({ Game: prop, TotalHours: holder[prop] });
         purchaseCount.push({ Game: prop, NumPurchased: pCount[prop] });
       }
       // Sorts from most average hours played to least and puts data in global variables
       totalPlayed = totalPlayed.sort((a, b) => b.HoursPlayed - a.HoursPlayed);
       purchaseCount = purchaseCount.sort((a, b) => b.NumPurchased - a.NumPurchased);

       // Test to make sure correct values are being printed
         //purchaseCount.forEach(printEach);
         //totalPlayed.forEach(printEach);
         //overallPlaytime.forEach(printEach);
         //console.log(purchaseCount.length);

       // update nbars variable and height after data is read in
       updateGraph(purchaseCount, 1);
});

// Reworked this so that you always pass in both hours played and purchase count
function updateGraph(newData, dataKey)
{
  var maXvalue = null;
  if (dataKey == 0)
      maXvalue = d3.max(totalPlayed, function(d) {return d.HoursPlayed});
  else
      maXvalue = d3.max(purchaseCount, function(d) {return d.NumPurchased});

  //set x and y axes
  var yAxis = d3.scaleBand()
            .range([0, (newData.length + 1) * 28])
            // Set paddingInner to change space between the bars
            .paddingInner(0.25)
            .domain(newData.map(function(d) {return d.Game }));

  var xAxis = d3.scaleLinear()
            .range([margin.left, width])
            .domain([0, maXvalue]);

  // appends background
  svg.append("rect")
     .attr("width", "100%")
     .attr("height", "100%")
     .style("fill", "#F5F5F2");

  // change header text
  if (dataKey == 0)
    d3.select("h4").text("Games by Number of Hours Played")
  else {
    d3.select("h4").text("Games by Total Copies Purchased")
  }

  // append x axis
  svg.append("g")
     .attr("class", "x axis")
     .attr("transform", "translate(" + 140 + ", " + 50 + ")")
     .call(d3.axisTop(xAxis).ticks(6))
     // Can increase the font size of the y-axis with this call, but some games have really long names
     .style("font-size", "14px");

  // append y axis
  svg.append("g")
     .attr("class", "y axis")
     .attr("transform", "translate(" + (margin.left + 140) + ", " + 50 + ")")
     .call(d3.axisLeft(yAxis))
     .style("font-size", "14px");

  // create the bars for bargraph
   svg.selectAll(".bar")
     .data(newData)
     .enter()
     .append("g")
     .append("rect")
     .attr("transform", "translate(" + (margin.left + 140) + ", " + 50 + ")")
     .attr("class", "bar")
     .attr("y", function(d) {return yAxis(d.Game); })
     .attr("height", yAxis.bandwidth())
     .attr("x", 0)
     .attr("width", function(d) {if (dataKey == 0) return xAxis(d.HoursPlayed)
                                 else return xAxis(d.NumPurchased);
                               })
     .on("click",tip.show);
}

// Updates graph with different dataset
var displayingAvg = false;
function changeGraph()
{
      svg.selectAll("*").remove();
      if (displayingAvg)
      {
          updateGraph(purchaseCount, 1);
          displayingAvg = false;
      }
      else
      {
          updateGraph(totalPlayed, 0);
          displayingAvg = true;
      }
}

function sortHighest()
{
      svg.selectAll("*").remove();
      totalPlayed = totalPlayed.sort((a, b) => b.HoursPlayed - a.HoursPlayed);
      purchaseCount = purchaseCount.sort((a, b) => b.NumPurchased - a.NumPurchased)
      if (displayingAvg)
      {
        updateGraph(totalPlayed, 0);
      }
      else
      {
        updateGraph(purchaseCount, 1);
          //purchaseCount.forEach(function(d) {console.log(d.NumPurchased)})
      }
}

// Probably works but I think we're having a display issue where all the lowest values are the statement
// And our graph's not fitting everything onto the page.
function sortLowest()
{
      svg.selectAll("*").remove();
      totalPlayed = totalPlayed.sort((a, b) => a.HoursPlayed - b.HoursPlayed);
      purchaseCount = purchaseCount.sort((a, b) => a.NumPurchased - b.NumPurchased);
      if (displayingAvg)
      {
        updateGraph(totalPlayed, 0);
      }
      else
      {
        // Print statement shows that this does sort correctly
        // But there's too many low values in the same range and graph only shows some of them
          //purchaseCount.forEach(function(d) {console.log(d.NumPurchased)})
        updateGraph(purchaseCount, 1);
      }
}

// Sorts the data alphabetically from 'A'-'Z'. Not case sensitive.
// Again, seems to sort correctly but it's not displaying all the data.
function sortAlphabet()
{
      svg.selectAll("*").remove();
      totalPlayed = totalPlayed.sort(function(a, b)
      {
        var game1 = a.Game.toLowerCase();
        var game2 = b.Game.toLowerCase();
        if (game1 > game2)
          return 1;
        if (game2 > game1)
          return -1;
        else
          return 0;
      });

      purchaseCount = purchaseCount.sort(function(a, b)
      {
        var game1 = a.Game.toLowerCase();
        var game2 = b.Game.toLowerCase();
        if (game1 > game2)
          return 1;
        if (game2 > game1)
          return -1;
        else
          return 0;
      });

      // Test print
      //totalPlayed.forEach(function(d) {console.log(d.Game); })

      if (displayingAvg)
      {
        updateGraph(totalPlayed, 0);
      }
      else
      {
        updateGraph(purchaseCount, 1);
      }
}

// Groups together games with the same x value
// Still need to figure out how we would display this (using hover tooltip maybe?)
function groupData()
{
  var hoursMap = {};
  // Not updating the actual variables for now, so it doesn't mess with the rendering
  var TEMP_totalPlayed = totalPlayed.forEach(function(d){
    // Rounds to the nearest whole digit to ensure that close decimal values are grouped together
    // Any game with less than 30 minutes played is listed as zero hours
      if (d.HoursPlayed >= 0.5)
          roundedHours = Math.round(d.HoursPlayed);
      else
          roundedHours = 0;

      hoursMap[roundedHours] = hoursMap[roundedHours] || [];
      hoursMap[roundedHours].push(d.Game);
  });
  var purchaseMap = {};
  var TEMP_purchaseCount = purchaseCount.forEach(function(d){
      purchaseMap[d.NumPurchased] = purchaseMap[d.NumPurchased] || [];
      purchaseMap[d.NumPurchased].push(d.Game);
  });

  // Prints map for testing
/*
  for (var key in purchaseMap)
  {
    console.log("Key: " + key + "\nGames: " + purchaseMap[key] + "\n");
  }*/
}
//end of file
