// barras-tipo-hotel.js
d3.csv("hotel_bookings.csv").then(function(data) {
    const counts = d3.rollup(data, v => v.length, d => d.hotel);
    const datos = Array.from(counts, ([hotel, reservas]) => ({hotel, reservas}));

    const width = 400, height = 300, margin = 40;
    const svg = d3.select("#barras-tipo-hotel")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const x = d3.scaleBand()
        .domain(datos.map(d => d.hotel))
        .range([margin, width - margin])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(datos, d => d.reservas)])
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

    svg.selectAll("rect")
        .data(datos)
        .enter()
        .append("rect")
        .attr("x", d => x(d.hotel))
        .attr("y", d => y(d.reservas))
        .attr("width", x.bandwidth())
        .attr("height", d => y(0) - y(d.reservas))
        .attr("fill", "#0074D9")
        .on("mousemove", (event, d) => {
            tooltip
              .style("opacity", 1)
              .html(`<strong>${d.hotel}</strong><br>Reservas: ${d.reservas}`)
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseleave", () => {
            tooltip.style("opacity", 0);
        });

    // Etiquetas de ejes
    svg.append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .text("Tipo de hotel");

    svg.append("text")
      .attr("class", "axis-label")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("Reservas");
});
