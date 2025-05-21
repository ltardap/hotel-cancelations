window.renderBarrasADR = function(data) {
    d3.select("#barras-adr").selectAll("*").remove();

    // Agrupa por tipo de estancia y hotel
    const tipos = ["Transient", "Transient-Party", "Contract", "Group"];
    const hoteles = Array.from(new Set(data.map(d => d.hotel)));
    const datos = [];

    tipos.forEach(tipo => {
        hoteles.forEach(hotel => {
            const subset = data.filter(d =>
                d.customer_type === tipo &&
                d.hotel === hotel &&
                !isNaN(+d.adr) &&
                +d.adr > 0 &&
                +d.adr < 10000 // Ajusta el máximo si lo necesitas
            );
            if (subset.length > 0) {
                datos.push({
                    tipo: tipo,
                    hotel: hotel,
                    adr: d3.mean(subset, d => +d.adr)
                });
            }
        });
    });

    // Si no hay datos, muestra mensaje y no pintes la gráfica
    if (datos.length === 0) {
      d3.select("#barras-adr").append("div")
        .style("text-align", "center")
        .style("color", "#888")
        .style("margin-top", "2em")
        .text("Sin datos para mostrar con los filtros seleccionados.");
      return;
    }

    const width = 1000, height = 550, margin = 30;
    const x = d3.scaleBand().domain(tipos).range([margin, width - margin]).padding(0.2);
    const x1 = d3.scaleBand().domain(hoteles).range([0, x.bandwidth()]).padding(0.05);
    const y = d3.scaleLinear().domain([0, d3.max(datos, d => d.adr)]).nice().range([height - margin, margin]);
    const color = d3.scaleOrdinal().domain(hoteles).range(["#FFDC00", "#0074D9"]);

    const svg = d3.select("#barras-adr")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width", "100%")
        .style("height", "auto");

    // Eje X
    svg.append("g")
        .attr("transform", `translate(0,${height - margin})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", "1.1em");

    // Eje Y
    svg.append("g")
        .attr("transform", `translate(${margin},0)`)
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "1.1em");

    // Barras
    svg.selectAll("g.barra")
        .data(datos)
        .enter()
        .append("rect")
        .attr("x", d => x(d.tipo) + x1(d.hotel))
        .attr("y", d => y(d.adr))
        .attr("width", x1.bandwidth())
        .attr("height", d => y(0) - y(d.adr))
        .attr("fill", d => color(d.hotel));

    // Tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip").style("opacity", 0);

    svg.selectAll("rect")
        .on("mousemove", (event, d) => {
            tooltip.style("opacity", 1)
              .html(`<strong>${d.tipo} - ${d.hotel}</strong><br>ADR medio: ${d.adr.toFixed(0)} €`)
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseleave", () => { tooltip.style("opacity", 0); });

    // Leyenda
    hoteles.forEach((hotel, i) => {
      svg.append("rect")
        .attr("x", width - 120)
        .attr("y", margin + i*20)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", color(hotel));
      svg.append("text")
        .attr("x", width - 100)
        .attr("y", margin + i*20 + 11)
        .text(hotel)
        .attr("font-size", "12px")
        .attr("alignment-baseline","middle");
    });

    // Etiquetas de los ejes
    svg.append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .text("Tipo de estancia");

    svg.append("text")
      .attr("class", "axis-label")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("ADR medio (€)");
};
