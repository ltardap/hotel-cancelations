// histograma-leadtime.js
d3.csv("hotel_bookings.csv").then(function(data) {
    function rango(lt) {
        lt = +lt;
        if (lt <= 7) return "0-7";
        if (lt <= 30) return "8-30";
        if (lt <= 90) return "31-90";
        if (lt <= 180) return "91-180";
        return "181+";
    }
    const canceladasPorRango = d3.rollups(
        data,
        v => ({
            total: v.length,
            canceladas: v.filter(d => +d.is_canceled === 1).length
        }),
        d => rango(d.lead_time)
    ).map(([rango, v]) => ({
        rango,
        tasa: (v.canceladas / v.total * 100).toFixed(1)
    }));

    const width = 400, height = 300, margin = 40;
    const svg = d3.select("#histograma-leadtime")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const x = d3.scaleBand()
        .domain(canceladasPorRango.map(d => d.rango))
        .range([margin, width - margin])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(canceladasPorRango, d => +d.tasa)])
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
        .data(canceladasPorRango)
        .enter()
        .append("rect")
        .attr("x", d => x(d.rango))
        .attr("y", d => y(d.tasa))
        .attr("width", x.bandwidth())
        .attr("height", d => y(0) - y(d.tasa))
        .attr("fill", "#2ECC40")
        .on("mousemove", (event, d) => {
            tooltip
              .style("opacity", 1)
              .html(`<strong>${d.rango} días</strong><br>Tasa de cancelación: ${d.tasa}%`)
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
      .text("Anticipación de reserva");

    svg.append("text")
      .attr("class", "axis-label")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("Tasa de cancelación (%)");
});
