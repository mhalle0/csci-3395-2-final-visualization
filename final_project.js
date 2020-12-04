function rowFunction(row)
{
  console.log(row);
}

d3.csv("steam-200k-cleaned.csv", rowFunction).then(function (d) { console.log("Hi") })
// end of file
