/* Define constants */
const JSON_URL = "https://raw.githubusercontent.com/ilixandr/iwannaweb.ro/master/projects/rawdata/global-temperature.json"
const TEMPBOX = {"width": 5, "height": 55}
const WIDTH = (2015 - 1753) * TEMPBOX.width
const HEIGHT = 12 * TEMPBOX.height
const PADDING = 200
const COLORS = {
  "BLUE1": "#0000FF", 
  "BLUE2": "#0064FC", 
  "BLUE3": "#00B4FC",
  "GREEN1": "#00FCD2",
  "GREEN2": "#00FF00",
  "GREEN3": "#58FC00",
  "RED1": "#FC7500",
  "RED2": "#FC3200",
  "RED3": "#FF0000"
}
const LEGEND_BOX_SIZE = 25
const ANIMATION_DURATION = 250
const OPACITY_VISIBLE = 0.8
const OPACITY_INVISIBLE = 0
/* Helper functions */
const getYears = (dataset) => {
  let years = [];
  for (let i = 0; i < dataset.monthlyVariance.length; i++) {
    years.push(dataset.monthlyVariance[i].year);
  }
  return years;
}
const getTemps = (dataset) => {
  let temps = [];
  for (let i = 0; i < dataset.monthlyVariance.length; i++) {
    temps.push(dataset.baseTemperature + dataset.monthlyVariance[i].variance);
  }
  return temps;
}
const addColor = (value) => {
  if (value < 3) return COLORS.BLUE1;
  if (value < 4.5) return COLORS.BLUE2;
  if (value < 6) return COLORS.BLUE3;
  if (value < 7) return COLORS.GREEN1;
  if (value < 8.5) return COLORS.GREEN2;
  if (value < 10) return COLORS.GREEN3;
  if (value < 11.5) return COLORS.RED1;
  if (value < 12.5) return COLORS.RED2;
  return COLORS.RED3;
}

/* Define the svg */
const canvas = d3.select("#canvas")
                 .append("svg")
                 .attr("width", WIDTH + PADDING)
                 .attr("height", HEIGHT + PADDING);
const legend = d3.select("#legend")
                 .append("svg")
                 .attr("width", 9 * LEGEND_BOX_SIZE + 10)
                 .attr("height", 2 * LEGEND_BOX_SIZE + 10);
const tooltip = d3.select("#tooltip");
/* Read JSON data */
d3.json(JSON_URL).then((dataset) => {

  const xScale = d3.scaleBand()
                   .domain(dataset.monthlyVariance.map((d) => d.year))
                   .range([0, WIDTH]);
  const yScale = d3.scaleBand()
                   .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
                   .range([0, HEIGHT]);
  const xAxis = d3.axisBottom(xScale).tickValues(xScale.domain().filter(d => d % 10 === 0)).tickFormat(d3.format("d"));
  const yAxis = d3.axisLeft(yScale).tickValues(yScale.domain()).tickFormat((d) => d3.timeFormat("%B")(new Date(2018, d - 1)));
  canvas.append("g")
        .attr("transform", "translate(" + PADDING / 2 + ", " + HEIGHT + ")").call(xAxis).attr("id", "x-axis");
  canvas.append("g")
        .attr("transform", "translate(" + PADDING / 2 + ", 0)").call(yAxis).attr("id", "y-axis");
  canvas.selectAll("rect")
        .data(dataset.monthlyVariance)
        .enter()
        .append("rect")
        .attr("x", (d) => PADDING / 2 + xScale(d.year))
        .attr("y", (d) => yScale(d.month))
        .attr("width", TEMPBOX.width)
        .attr("height", TEMPBOX.height)
        .attr("fill", (d) => addColor(dataset.baseTemperature + d.variance))
        .attr("class", "cell")
        .attr("data-month", (d) => d.month - 1)
        .attr("data-year", (d) => d.year)
        .attr("data-temp", (d) => d.variance)
        .on("mouseover", (d, i) => {
    tooltip.transition()
           .duration(ANIMATION_DURATION)
           .style("opacity", OPACITY_VISIBLE)
    tooltip.html( "Year " + d.year + "<br />Temperature: " + (d.variance + dataset.baseTemperature).toFixed(2) + "&#8451;")
           .style("left", xScale(d.year) + PADDING + "px")
           .style("top", yScale(d.month) + PADDING / 2 + "px")
           .attr("data-year", d.year);
           
  })
        .on("mouseout", () => {
    tooltip.transition()
           .duration(ANIMATION_DURATION)
           .style("opacity", OPACITY_INVISIBLE)
  });
  /* Define legend data */
  legend.selectAll("rect")
        .data(["BLUE1", "BLUE2", "BLUE3", "GREEN1", "GREEN2", "GREEN3", "RED1", "RED2", "RED3"])
        .enter()
        .append("rect")
        .attr("width", LEGEND_BOX_SIZE)
        .attr("height", LEGEND_BOX_SIZE)
        .attr("x", (d, i) => i * LEGEND_BOX_SIZE)
        .attr("y", 0)
        .attr("fill", (d) => COLORS[d]);
  let temps = getTemps(dataset);
  legendXScale = d3.scaleLinear()
                   .domain([d3.min(temps), d3.max(temps)])
                   .range([0, 9 * LEGEND_BOX_SIZE]);
  legendXAxis = d3.axisBottom(legendXScale);
  legend.append("g")
        .attr("transform", "translate(0, " + LEGEND_BOX_SIZE + ")").call(legendXAxis);
});