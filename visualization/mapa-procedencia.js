// mapa-procedencia.js
d3.csv("hotel_bookings.csv").then(function(data) {
    const counts = d3.rollup(data, v => v.length, d => d.country);
    const datos = Array.from(counts, ([country, reservas]) => ({country, reservas}));
    const top = datos.sort((a,b) => d3.descending(a.reservas, b.reservas)).slice(0,10);

    const width = 500, height = 300, margin = 40;
    const svg = d3.select("#mapa-procedencia")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const x = d3.scaleBand()
        .domain(top.map(d => d.country))
        .range([margin, width - margin])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(top, d => d.reservas)])
        .range([height - margin, margin]);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("transform", `translate(${margin},0)`)
        .call(d3.axisLeft(y));

    // Tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    svg.selectAll("circle")
        .data(top)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.country) + x.bandwidth()/2)
        .attr("cy", d => y(d.reservas))
        .attr("r", d => Math.sqrt(d.reservas)/10)
        .attr("fill", "#FF851B")
        .on("mousemove", (event, d) => {
            tooltip
              .style("opacity", 1)
              .html(`<strong>${d.country}</strong><br>Reservas: ${d.reservas}`)
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseleave", () => {
            tooltip.style("opacity", 0);
        });

    svg.selectAll("text.label")
        .data(top)
        .enter()
        .append("text")
        .attr("x", d => x(d.country) + x.bandwidth()/2)
        .attr("y", d => y(d.reservas) - 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .text(d => d.country);

    // Etiquetas de ejes
    svg.append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .text("País");

    svg.append("text")
      .attr("class", "axis-label")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("Reservas");
});
