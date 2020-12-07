// set dimensions and margins of the graph
margin = ({top: 100, right: 20, bottom: 70, left: 220});
var width = 2000;
var height = 4048;

// Declare variables here to take them out of the data.csv function
var totalPlayed = [];
var purchaseCount = [];

var nbars = purchaseCount.length;

// Test function for printing each object
function printEach(row)
{
  console.log(row);
}


// Append stuff to svg
const svg = d3.select("body")
              .append("svg")
              .attr("width", width)
              .attr("height", height);

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
         purchaseCount.push({ Game: prop, NumPurchased: pCount[prop] });
       }
       // Sorts from most average hours played to least
       totalPlayed = totalPlayed.sort((a, b) => b.HoursPlayed - a.HoursPlayed);
       purchaseCount = purchaseCount.sort((a, b) => b.NumPurchased - a.NumPurchased);
       // Test to make sure correct values are being printed
       //purchaseCount.forEach(printEach);
       //totalPlayed.forEach(printEach);
       //console.log(purchaseCount.length);

       //*****set x and y axes (not displaying axes labels correctly)*****
       var yAxis = d3.scaleBand()
                 .range([0, (purchaseCount.length + 1) * 28])
                 .domain(purchaseCount.map(function(d) {return d.Game }));

       var xAxis = d3.scaleLinear()
                 .range([margin.left, width])
                 .domain([0, d3.max(purchaseCount, function(d) {return d.NumPurchased })]);

       // appends background
       svg.append("rect")
          .attr("width", "100%")
          .attr("height", "100%")
          .style("fill", "#F5F5F2")

       // Need to append theh bars before the axes, so they are layered beneath
       updateBars(purchaseCount, 1);

       // append x axis
       svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0, " + 50 + ")")
          .call(d3.axisTop(xAxis).ticks(6));

       // append y axis
       svg.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + margin.left + ", " + 50 + ")")
          .call(d3.axisLeft(yAxis));

       // Using ints (dataKey) to identify which dataset is being used for now. Probably a better way to do this.
       // 0 is for average hours played dataset
       // 1 is for total copies purchased dataset
       function updateBars(newData, dataKey)
       {
         // create the bars for bargraph
          svg.selectAll(".bar")
            .data(newData)
            .enter()
            .append("g")
            .append("rect")
            .attr("transform", "translate(" + margin.left + ", " + 50 + ")")
            .attr("class", "bar")
            .attr("y", function(d) {return yAxis(d.Game); })
            .attr("height", yAxis.bandwidth())
            .attr("x", 0)
            .attr("width", function(d) {if (dataKey == 0) return xAxis(d.HoursPlayed)
                                        else return xAxis(d.NumPurchased);
                                      });
       }
});
//end of line
