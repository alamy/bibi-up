// comissoes-graficos.js
// Gráficos de festas por mês (vela) e por horário (pizza)

document.addEventListener('DOMContentLoaded', function() {
  // Autenticação igual ao dashboard
  if (localStorage.getItem('patiocafe_auth') !== 'ok') {
    window.location.href = 'login.html';
    return;
  }

  // Carregar eventos
  fetch('datas_ocupadas.json')
    .then(resp => resp.json())
    .then(eventos => {
      renderGraficoMes(eventos);
      renderGraficoHorario(eventos);
    });

  // Gráfico de festas por mês (vela/barra)
  function renderGraficoMes(eventos) {
    const meses = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    const festasPorMes = Array(12).fill(0);
    eventos.forEach(ev => {
      const [dia, mes] = ev.data.split('/');
      festasPorMes[parseInt(mes,10)-1]++;
    });
    const ctx = document.getElementById('grafico-mes').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: meses,
        datasets: [{
          label: 'Festas por mês',
          data: festasPorMes,
          backgroundColor: '#fff2',
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: '#fff2' }, ticks: { color: '#fff' } },
          y: { beginAtZero: true, grid: { color: '#fff2' }, ticks: { color: '#fff' } }
        }
      }
    });
  }

  // Gráfico de pizza por horário
  function renderGraficoHorario(eventos) {
    const horarios = ['matutino', 'vespertino', 'noturno'];
    const cores = ['#fff', '#888', '#222'];
    const festasPorHorario = [0,0,0];
    eventos.forEach(ev => {
      const idx = horarios.indexOf(ev.horario);
      if(idx>=0) festasPorHorario[idx]++;
    });
    const ctx = document.getElementById('grafico-horario').getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Matutino', 'Vespertino', 'Noturno'],
        datasets: [{
          data: festasPorHorario,
          backgroundColor: cores,
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        plugins: { legend: { labels: { color: '#fff', font: { weight: 'bold' } } } }
      }
    });
  }
});
