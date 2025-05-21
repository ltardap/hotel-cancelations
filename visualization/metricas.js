let datosGlobales = [];

// Renderiza las métricas clave en el dashboard
function renderMetricas(data) {
    const contenedor = d3.select("#metricas");
    contenedor.selectAll("*").remove();

    if (!data || data.length === 0) {
        contenedor.append("div")
            .attr("class", "card")
            .html('<span class="big" style="color:#bbb">0</span><span>Sin datos</span>');
        return;
    }

    const totalReservas = data.length;
    const canceladas = data.filter(d => +d.is_canceled === 1).length;
    const tasaCancelacion = totalReservas === 0 ? "0%" : ((canceladas / totalReservas) * 100).toFixed(1) + "%";
    const totalEstancias = data.map(d => +d.stays_in_weekend_nights + +d.stays_in_week_nights);
    const estanciaMedia = totalReservas === 0 ? "0 días" : (d3.mean(totalEstancias)).toFixed(1) + " días";
    const adrValido = data.filter(d => +d.adr > 0 && +d.adr < 1000);
    const adrPromedio = adrValido.length === 0 ? "0 €" : (d3.mean(adrValido, d => +d.adr)).toFixed(0) + " €";

    const metricas = [
        { titulo: "Total reservas", valor: totalReservas },
        { titulo: "Tasa cancelación", valor: tasaCancelacion },
        { titulo: "Estancia media", valor: estanciaMedia },
        { titulo: "ADR promedio", valor: adrPromedio }
    ];

    contenedor.selectAll("div.card")
        .data(metricas)
        .enter()
        .append("div")
        .attr("class", "card")
        .html(d => `<span class="big">${d.valor}</span><span>${d.titulo}</span>`);
}

function getFiltros() {
    return {
        hotel: d3.select("#filtro-hotel").property("value"),
        pais: d3.select("#filtro-pais").property("value"),
        anio: d3.select("#filtro-anio").property("value"),
        segmento: d3.select("#filtro-segmento").property("value")
    };
}

function filtrarDatos() {
    let datos = datosGlobales;
    const f = getFiltros();
    if (f.hotel !== "all") datos = datos.filter(d => d.hotel === f.hotel);
    if (f.pais !== "all") datos = datos.filter(d => d.country === f.pais);
    if (f.anio !== "all") datos = datos.filter(d => d.arrival_date_year === f.anio);
    if (f.segmento !== "all") datos = datos.filter(d => d.market_segment === f.segmento);
    return datos;
}

function actualizarTodo() {
    const datosFiltrados = filtrarDatos();
    renderMetricas(datosFiltrados);
    // Llama aquí a otras funciones de visualización si las tienes
    if (window.renderBarrasPaises) window.renderBarrasPaises(datosFiltrados);
    if (window.renderLineaTemporal) window.renderLineaTemporal(datosFiltrados);
    if (window.renderBarrasCancelacion) window.renderBarrasCancelacion(datosFiltrados);
    if (window.renderBarrasADR) window.renderBarrasADR(datosFiltrados);
}

d3.csv("hotel_bookings.csv").then(function(data) {
    datosGlobales = data;

    // Rellenar filtros dinámicamente
    const paises = Array.from(new Set(data.map(d => d.country))).sort();
    const selectPais = d3.select("#filtro-pais");
    paises.forEach(pais => {
        selectPais.append("option").attr("value", pais).text(pais);
    });

    const anios = Array.from(new Set(data.map(d => d.arrival_date_year))).sort();
    const selectAnio = d3.select("#filtro-anio");
    anios.forEach(anio => {
        selectAnio.append("option").attr("value", anio).text(anio);
    });

    const segmentos = Array.from(new Set(data.map(d => d.market_segment))).sort();
    const selectSegmento = d3.select("#filtro-segmento");
    segmentos.forEach(seg => {
        selectSegmento.append("option").attr("value", seg).text(seg);
    });

    // Render inicial
    actualizarTodo();

    // Eventos de filtro
    d3.selectAll("#filtro-hotel, #filtro-pais, #filtro-anio, #filtro-segmento").on("change", actualizarTodo);
});

// Permite a otros scripts acceder a los datos filtrados
window.getDatosFiltrados = filtrarDatos;
