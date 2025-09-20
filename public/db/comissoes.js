// comissoes.js

document.addEventListener('DOMContentLoaded', function() {
  // Autenticação igual ao dashboard
  if (localStorage.getItem('patiocafe_auth') !== 'ok') {
    window.location.href = 'login.html';
    return;
  }

  // Menu navegação
  const btnDash = document.getElementById('menu-dashboard');
  if (btnDash) {
    btnDash.onclick = function() {
      window.location.href = 'dashboard.html';
    };
  }

  // Filtros de mês e ano
  const filtroMes = document.getElementById('filtro-mes');
  const filtroAno = document.getElementById('filtro-ano');
  let eventosGlobais = [];

  function popularFiltros(eventos) {
    // Meses
    const meses = [
      'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
      'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
    ];
    filtroMes.innerHTML = '';
    for(let i=0;i<12;i++) {
      const opt = document.createElement('option');
      opt.value = (i+1).toString().padStart(2,'0');
      opt.textContent = meses[i];
      filtroMes.appendChild(opt);
    }
    // Anos presentes nos eventos
    const anos = Array.from(new Set(eventos.map(ev => ev.data.split('/')[2]))).sort();
    filtroAno.innerHTML = '';
    anos.forEach(ano => {
      const opt = document.createElement('option');
      opt.value = ano;
      opt.textContent = ano;
      filtroAno.appendChild(opt);
    });
    // Seleciona mês/ano atual
    const now = new Date();
    filtroMes.value = (now.getMonth()+1).toString().padStart(2,'0');
    filtroAno.value = now.getFullYear().toString();
  }

  function filtrarEventosPorMesAno(eventos) {
    const mes = filtroMes.value;
    const ano = filtroAno.value;
    return eventos.filter(ev => {
      if (!ev.data) return false;
      const [dia, mesEv, anoEv] = ev.data.split('/');
      return mesEv === mes && anoEv === ano;
    });
  }

  function filtrarEventosPorMesAnoFaturados(eventos) {
    const mes = filtroMes.value;
    const ano = filtroAno.value;
    // Comissão só para eventos faturados e no mês seguinte ao fechamento
    return eventos.filter(ev => {
      if (!ev.data || !ev.fechamento) return false;
      if (ev.fechamento !== 'cliente faturado') return false;
      // mês/ano do fechamento = mês/ano selecionado - 1 mês
      const [dia, mesEv, anoEv] = ev.data.split('/');
      let mesComissao = parseInt(mesEv,10) + 1;
      let anoComissao = parseInt(anoEv,10);
      if (mesComissao > 12) { mesComissao = 1; anoComissao++; }
      return mesComissao.toString().padStart(2,'0') === mes && anoComissao.toString() === ano;
    });
  }

  function renderComissao(eventos) {
    const comissaoInfo = document.getElementById('comissao-info');
    if (!comissaoInfo) return;
    const total = eventos.reduce((soma, ev) => soma + (Number(ev.valor)||0), 0);
    const comissao = total * 0.02;
    comissaoInfo.innerHTML = `Comissão da vendedora (2%): <span style="color:var(--gold,#c9a14a)">R$ ${comissao.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span> <br>Total de eventos faturados: <b>${eventos.length}</b>`;
  }

  function renderProgressoComissao(eventos) {
    const meta = 2000;
    const totalMes = eventos.reduce((soma, ev) => soma + (Number(ev.valor)||0), 0);
    const comissaoMes = totalMes * 0.02;
    const perc = Math.min(100, Math.round((comissaoMes/meta)*100));
    // Atualiza barra
    const barra = document.getElementById('barra-progresso-comissao');
    const label = document.getElementById('progresso-label');
    const valor = document.getElementById('progresso-valor');
    if(barra && label && valor) {
      barra.style.width = perc + '%';
      label.textContent = perc + '%';
      valor.textContent = 'Comissão atual: R$ ' + comissaoMes.toLocaleString('pt-BR', {minimumFractionDigits:2});
    }
  }

  function renderResumoAtendimento(eventos) {
    const divResumo = document.getElementById('resumo-atendimento');
    if (!divResumo) return;
    // Eventos prospectados: fechamento = 'cliente prospectado'
    // Eventos faturados: fechamento = 'cliente faturado'
    let prospectados = 0;
    let faturados = 0;
    eventos.forEach(ev => {
      if(ev.fechamento === 'cliente prospectado') prospectados++;
      if(ev.fechamento === 'cliente faturado') faturados++;
    });
    divResumo.innerHTML = `Eventos prospectados: <span style="color:#ffe066">${prospectados}</span> &nbsp;|&nbsp; Eventos faturados: <span style="color:#7fff7f">${faturados}</span>`;
  }

  function atualizarTudo() {
    const eventosFiltrados = filtrarEventosPorMesAnoFaturados(eventosGlobais);
    // Para o resumo, filtrar todos do mês/ano (não só faturados)
    const mes = filtroMes.value;
    const ano = filtroAno.value;
    const eventosMesAno = eventosGlobais.filter(ev => {
      if (!ev.data) return false;
      const [dia, mesEv, anoEv] = ev.data.split('/');
      return mesEv === mes && anoEv === ano;
    });
    renderResumoAtendimento(eventosMesAno);
    renderComissao(eventosFiltrados);
    renderProgressoComissao(eventosFiltrados);
    // Atualizar gráficos se existirem
    if(window.renderGraficoMes && window.renderGraficoHorario) {
      window.renderGraficoMes(eventosFiltrados, true);
      window.renderGraficoHorario(eventosFiltrados, true);
    }
  }

  fetch('datas_ocupadas.json')
    .then(resp => resp.json())
    .then(json => {
      eventosGlobais = json;
      popularFiltros(json);
      atualizarTudo();
    })
    .catch(() => {
      document.getElementById('comissao-info').innerHTML = '<span style="color:#b00">Erro ao carregar eventos.</span>';
    });

  if(filtroMes && filtroAno) {
    filtroMes.onchange = filtroAno.onchange = atualizarTudo;
  }

  // Logout
  const logoutBtn = document.querySelector('.logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('patiocafe_auth');
      window.location.href = 'login.html';
    });
  }
});
