window.renderBarrasPaises = function(data) {
    d3.select("#barras-paises").selectAll("*").remove();
    // Agrupa por país
    const counts = d3.rollup(data, v => v.length, d => d.country);
    const datos = Array.from(counts, ([country, reservas]) => ({country, reservas}));
    const top = datos.sort((a,b) => d3.descending(a.reservas, b.reservas)).slice(0,10);

    // Tamaño del gráfico (ajusta según el CSS de .chart-container)
    const width = 1000, height = 800, margin = 50;

    const svg = d3.select("#barras-paises")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width", "100%")
        .style("height", "auto");

    const x = d3.scaleBand()
        .domain(top.map(d => d.country))
        .range([margin, width - margin])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(top, d => d.reservas)])
        .range([height - margin, margin]);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("font-size", "0.7em")
        .attr("transform", "rotate(-30)")
        .style("text-anchor", "end");

    svg.append("g")
        .attr("transform", `translate(${margin},0)`)
        .call(d3.axisLeft(y));

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip").style("opacity", 0);

    svg.selectAll("rect")
        .data(top)
        .enter()
        .append("rect")
        .attr("x", d => x(d.country))
        .attr("y", d => y(d.reservas))
        .attr("width", x.bandwidth())
        .attr("height", d => y(0) - y(d.reservas))
        .attr("fill", "#0074D9")
        .on("mousemove", (event, d) => {
            tooltip.style("opacity", 1)
              .html(`<strong>${d.country}</strong><br>Reservas: ${d.reservas}`)
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseleave", () => { tooltip.style("opacity", 0); });

    svg.append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", height)
      .attr("text-anchor", "middle")
      .text("País");

    svg.append("text")
      .attr("class", "axis-label")
      .attr("x", -height / 2)
      .attr("y", 11)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("Reservas");
};
