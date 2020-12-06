// set dimensions and margins of the graph
margin = ({top: 100, right: 20, bottom: 70, left: 140});
var width = 800;
var height = 4048;

// Test function for printing each object
function printEach(row)
{
  console.log(row);
}

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
         // Calculates average hours played (Excludes all null elements)
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

         // Calculates number of times purchased (excludes playtime entries)
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
       var totalPlayed = [];
       var purchaseCount = []
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
});

// Append stuff to svg
const svg = d3.select("body")
              .append("svg")
              .attr("width", width)
              .attr("height", height);
// end of file
