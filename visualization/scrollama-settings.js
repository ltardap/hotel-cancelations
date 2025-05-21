const scroller = scrollama();

function updateChart(stepIndex) {
  if (stepIndex === 0) {
    window.applyFilter();
    window.drawBarChartMes(window.getCurrentData());
  } else if (stepIndex === 1) {
    window.drawBarChartPais(window.allData.pais);
  } else if (stepIndex === 2) {
    window.drawBarChartDia(window.allData.dia);
  }
}

scroller
  .setup({
    step: ".step",
    offset: 0.5,
    debug: false
  })
  .onStepEnter(response => {
    d3.selectAll('.step').classed('is-active', (d, i) => i === response.index);
    updateChart(response.index);
  });

// Al cargar la página, muestra la primera gráfica
updateChart(0);
