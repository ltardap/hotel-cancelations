window.renderBarrasCancelacion = function(data) {
    d3.select("#barras-cancelacion").selectAll("*").remove();
    // Agrupa por segmento y calcula tasa de cancelación
    const segmentos = Array.from(new Set(data.map(d => d.market_segment)));
    const datos = segmentos.map(seg => {
        const subset = data.filter(d => d.market_segment === seg);
        const total = subset.length;
        const canceladas = subset.filter(d => +d.is_canceled === 1).length;
        return {
            segmento: seg,
            tasa: total === 0 ? 0 : (canceladas / total) * 100
        };
    });

    const width = 1000, height = 550, margin = 50;
    const svg = d3.select("#barras-cancelacion")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width", "100%")
        .style("height", "auto");

    const x = d3.scaleBand()
        .domain(segmentos)
        .range([margin, width - margin])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(datos, d => d.tasa)]).nice()
        .range([height - margin, margin]);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin})`)
        .call(d3.axisBottom(x));
    svg.append("g")
        .attr("transform", `translate(${margin},0)`)
        .call(d3.axisLeft(y));

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip").style("opacity", 0);

    svg.selectAll("rect")
        .data(datos)
        .enter()
        .append("rect")
        .attr("x", d => x(d.segmento))
        .attr("y", d => y(d.tasa))
        .attr("width", x.bandwidth())
        .attr("height", d => y(0) - y(d.tasa))
        .attr("fill", "#FF4136")
        .on("mousemove", (event, d) => {
            tooltip.style("opacity", 1)
              .html(`<strong>${d.segmento}</strong><br>Tasa de cancelación: ${d.tasa.toFixed(1)}%`)
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseleave", () => { tooltip.style("opacity", 0); });

    svg.append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .text("Segmento");

    svg.append("text")
      .attr("class", "axis-label")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("Tasa de cancelación (%)");
};
