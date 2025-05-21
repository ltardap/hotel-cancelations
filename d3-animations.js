let datosPie = [];
let datosPais = [];
let datosTipo = [];
let datosMes = [];
let vistaActual = 0;
let filtroMes = "All";

// Carga todos los datos al principio
Promise.all([
  d3.json("../data/cancelaciones_pie.json"),    // Para tarta cancelaciones vs no cancelaciones
  d3.json("../data/cancelaciones_pais.json"),   // Para barras horizontales por país
  d3.json("../data/cancelaciones_tipo.json"),   // Para barras por tipo de alojamiento
  d3.json("../data/cancelaciones_mes.json")     // Para evolución temporal (línea)
]).then(([pie, pais, tipo, mes]) => {
  datosPie = pie;
  datosPais = pais;
  datosTipo = tipo;
  datosMes = mes;
  activarVista(0);
  configurarMenu();
  configurarFiltros();
});

// Menú de navegación
function configurarMenu() {
  d3.selectAll('.menu-item').on('click', function() {
    const vista = +this.getAttribute('data-vista');
    activarVista(vista);
  });
}

// Filtros contextuales
function configurarFiltros() {
  d3.select("#mes-filter").on("change", function() {
    filtroMes = this.value;
    if (vistaActual === 3) activarVista(3); // Solo afecta a la evolución temporal
  });
}

// Activa la vista correspondiente
function activarVista(vista) {
  vistaActual = vista;
  d3.selectAll('.menu-item').classed('active', false);
  d3.select('.menu-item[data-vista="' + vista + '"]').classed('active', true);
  // Oculta todos los filtros
  document.getElementById('filtro-mes').style.display = "none";

  if (vista === 0) {
    document.getElementById('titulo-grafica').textContent = "Cancelaciones vs No cancelaciones";
    document.getElementById('descripcion-grafica').textContent = "Proporción y número total de reservas canceladas y no canceladas.";
    drawPieChart(datosPie);
  } else if (vista === 1) {
    document.getElementById('titulo-grafica').textContent = "País de origen de las cancelaciones (Top 10)";
    document.getElementById('descripcion-grafica').textContent = "Ranking de países con mayor número de cancelaciones.";
    drawHorizontalBar(datosPais, 'pais', 'cancelaciones', 'País', 'Cancelaciones');
  } else if (vista === 2) {
    document.getElementById('titulo-grafica').textContent = "Cancelaciones por tipo de alojamiento";
    document.getElementById('descripcion-grafica').textContent = "Comparativa de cancelaciones entre tipos de alojamiento.";
    drawBarChart(datosTipo, 'tipo', 'cancelaciones', 'Tipo', 'Cancelaciones');
  } else if (vista === 3) {
    document.getElementById('titulo-grafica').textContent = "Evolución temporal de cancelaciones";
    document.getElementById('descripcion-grafica').textContent = "Tasa de cancelación por mes. Puedes filtrar por mes concreto.";
    document.getElementById('filtro-mes').style.display = "inline-block";
    let datosFiltrados = (filtroMes === "All") ? datosMes : datosMes.filter(d => d.mes === filtroMes);
    drawLineChart(datosFiltrados, 'mes', 'tasa', 'Mes', 'Tasa de cancelación');
  }
}

// Pie chart para cancelaciones globales
function drawPieChart(data) {
  const svg = d3.select("#chart");
  svg.selectAll("*").remove();
  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const radius = Math.min(width, height) / 2 - 80;
  const g = svg.append("g").attr("transform", `translate(${width/2},${height/2})`);
  const color = d3.scaleOrdinal().domain(data.map(d => d.estado)).range(["#ff7f50", "#87cefa"]);

  const pie = d3.pie().value(d => d.valor);
  const data_ready = pie(data);

  g.selectAll('path')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', d3.arc().innerRadius(0).outerRadius(radius))
    .attr('fill', d => color(d.data.estado))
    .attr('stroke', '#fff')
    .attr('stroke-width', 2);

  // Etiquetas
  g.selectAll('text')
    .data(data_ready)
    .enter()
    .append('text')
    .text(d => `${d.data.estado}: ${d.data.valor}`)
    .attr("transform", d => `translate(${d3.arc().innerRadius(0).outerRadius(radius*0.7).centroid(d)})`)
    .style("text-anchor", "middle")
    .style("font-size", 18);

  // Leyenda
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 200},${height/2 - 60})`);
  data.forEach((d, i) => {
    legend.append("rect")
      .attr("x", 0).attr("y", i*30)
      .attr("width", 20).attr("height", 20)
      .attr("fill", color(d.estado));
    legend.append("text")
      .attr("x", 30).attr("y", i*30 + 15)
      .text(`${d.estado} (${d.valor})`)
      .attr("font-size", 16);
  });
}

// Barras horizontales por país
function drawHorizontalBar(data, xKey, yKey, xLabel, yLabel) {
  const svg = d3.select("#chart");
  svg.selectAll("*").remove();
  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const margin = {top: 40, right: 40, bottom: 60, left: 120};

  const y = d3.scaleBand()
    .domain(data.map(d => d[xKey]))
    .range([margin.top, height - margin.bottom])
    .padding(0.2);

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[yKey]) * 1.1 || 1])
    .range([margin.left, width - margin.right]);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("y", d => y(d[xKey]))
    .attr("x", margin.left)
    .attr("height", y.bandwidth())
    .attr("width", d => x(d[yKey]) - margin.left)
    .attr("fill", "#87cefa");

  // Etiquetas
  svg.selectAll(".label")
    .data(data)
    .enter()
    .append("text")
    .attr("x", d => x(d[yKey]) + 5)
    .attr("y", d => y(d[xKey]) + y.bandwidth()/2 + 5)
    .text(d => d[yKey])
    .attr("font-size", 14);
}

// Barras verticales por tipo
function drawBarChart(data, xKey, yKey, xLabel, yLabel) {
  const svg = d3.select("#chart");
  svg.selectAll("*").remove();
  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const margin = {top: 40, right: 20, bottom: 60, left: 80};

  const x = d3.scaleBand()
    .domain(data.map(d => d[xKey]))
    .range([margin.left, width - margin.right])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[yKey]) * 1.1 || 1])
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).tickFormat(d3.format(".0f")));

  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d[xKey]))
    .attr("y", d => y(d[yKey]))
    .attr("width", x.bandwidth())
    .attr("height", d => y(0) - y(d[yKey]))
    .attr("fill", "#ffb347");

  svg.selectAll(".label")
    .data(data)
    .enter()
    .append("text")
    .attr("x", d => x(d[xKey]) + x.bandwidth()/2)
    .attr("y", d => y(d[yKey]) - 5)
    .attr("text-anchor", "middle")
    .text(d => d[yKey])
    .attr("font-size", 14);
}

// Línea para evolución temporal
function drawLineChart(data, xKey, yKey, xLabel, yLabel) {
  const svg = d3.select("#chart");
  svg.selectAll("*").remove();
  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const margin = {top: 40, right: 20, bottom: 60, left: 80};

  const x = d3.scalePoint()
    .domain(data.map(d => d[xKey]))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[yKey]) * 1.1 || 1])
    .range([height - margin.bottom, margin.top]);

  const line = d3.line()
    .x(d => x(d[xKey]))
    .y(d => y(d[yKey]));

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).tickFormat(d3.format(".2f")));

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#2196f3")
    .attr("stroke-width", 4)
    .attr("d", line);

  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d[xKey]))
    .attr("cy", d => y(d[yKey]))
    .attr("r", 6)
    .attr("fill", "#2196f3");
}
