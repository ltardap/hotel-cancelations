window.renderLineaTemporal = function(data) {
    d3.select("#linea-temporal").selectAll("*").remove();
    const meses = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const parseMes = d => meses.indexOf(d) + 1;
    const datos = d3.rollups(
        data,
        v => v.length,
        d => d.arrival_date_year,
        d => d.arrival_date_month
    ).flatMap(([year, arr]) =>
        arr.map(([month, count]) => ({
            year: year,
            month: month,
            mesNum: parseMes(month),
            reservas: count
        }))
    );

    const width = 1000, height = 850, margin = 50;
    const svg = d3.select("#linea-temporal")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width", "100%")
        .style("height", "auto");

    const x = d3.scalePoint()
        .domain(meses)
        .range([margin, width - margin]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(datos, d => d.reservas)]).nice()
        .range([height - margin, margin]);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin})`)
        .call(d3.axisBottom(x));
    svg.append("g")
        .attr("transform", `translate(${margin},0)`)
        .call(d3.axisLeft(y));

    const years = Array.from(new Set(datos.map(d => d.year)));
    const color = d3.scaleOrdinal().domain(years).range(d3.schemeSet2);

    years.forEach(year => {
        const datosYear = datos.filter(d => d.year === year)
            .sort((a, b) => a.mesNum - b.mesNum);

        svg.append("path")
            .datum(datosYear)
            .attr("fill", "none")
            .attr("stroke", color(year))
            .attr("stroke-width", 2)
            .attr("d", d3.line()
                .x(d => x(d.month))
                .y(d => y(d.reservas))
            );
    });

    svg.selectAll("legend-dots")
        .data(years)
        .enter()
        .append("circle")
        .attr("cx", width - 100)
        .attr("cy", (d,i) => margin + i*20)
        .attr("r", 6)
        .style("fill", d => color(d));
    svg.selectAll("legend-labels")
        .data(years)
        .enter()
        .append("text")
        .attr("x", width - 90)
        .attr("y", (d,i) => margin + i*20 + 5)
        .text(d => d)
        .attr("font-size", "12px")
        .attr("alignment-baseline","middle");

    svg.append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Mes");

    svg.append("text")
      .attr("class", "axis-label")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("Reservas");
};
