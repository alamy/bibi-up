// dashboard.js refeito para leitura correta do datas_ocupadas.json e CRUD funcional
document.addEventListener('DOMContentLoaded', function() {
  // Proteção: só acessa se autenticado
  if (localStorage.getItem('patiocafe_auth') !== 'ok') {
    window.location.href = 'login.html';
    return;
  }

  // Funções utilitárias de data
  function toISO(dataBR) {
    if (!dataBR) return '';
    const [d, m, a] = dataBR.split('/');
    return `${a}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }
  function fromISO(dataISO) {
    if (!dataISO) return '';
    const [a, m, d] = dataISO.split('-');
    return `${d.padStart(2,'0')}/${m.padStart(2,'0')}/${a}`;
  }

  let eventos = [];
  let editIndex = null;
  let filtroFechamento = '';
  let filtroTipo = '';

  function getFiltros() {
    const selFechamento = document.getElementById('filtro-fechamento');
    const selTipo = document.getElementById('filtro-tipo');
    filtroFechamento = selFechamento ? selFechamento.value : '';
    filtroTipo = selTipo ? selTipo.value : '';
  }

  function eventosFiltrados() {
    return eventos.filter(ev => {
      let ok = true;
      if (filtroFechamento && ev.fechamento !== filtroFechamento) ok = false;
      if (filtroTipo && ev.tipo !== filtroTipo) ok = false;
      return ok;
    });
  }

  function renderTabela() {
    getFiltros();
    const tbody = document.getElementById('eventos-tbody');
    const lista = eventosFiltrados();
    if (!lista.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#aaa;">Nenhum evento cadastrado.</td></tr>';
      return;
    }
    tbody.innerHTML = '';
    lista.forEach((ev, idx) => {
      const tr = document.createElement('tr');
      if (editIndex === idx) {
        tr.innerHTML = `
          <td><input type="date" value="${toISO(ev.data)}" id="edit-data"></td>
          <td><input type="number" min="1" max="300" value="${parseInt(ev.publico)}" id="edit-publico"></td>
          <td><select id="edit-tipo">
            <option value="casa exclusiva"${ev.tipo==='casa exclusiva'?' selected':''}>Casa exclusiva</option>
            <option value="salão"${ev.tipo==='salão'?' selected':''}>Salão</option>
            <option value="outro"${ev.tipo==='outro'?' selected':''}>Outro</option>
          </select></td>
          <td><select id="edit-horario">
            <option value="matutino"${ev.horario==='matutino'?' selected':''}>Matutino</option>
            <option value="vespertino"${ev.horario==='vespertino'?' selected':''}>Vespertino</option>
            <option value="noturno"${ev.horario==='noturno'?' selected':''}>Noturno</option>
          </select></td>
          <td><select id="edit-fechamento">
            <option value="cliente em potencial"${ev.fechamento==='cliente em potencial'?' selected':''}>Cliente em potencial</option>
            <option value="cliente prospectado"${ev.fechamento==='cliente prospectado'?' selected':''}>Cliente prospectado</option>
            <option value="cliente faturado"${ev.fechamento==='cliente faturado'?' selected':''}>Cliente faturado</option>
          </select></td>
          <td><input type="number" min="0" id="edit-valor" value="${ev.valor||''}" style="width:90px;"></td>
          <td>
            <button class="btn btn-primary" id="salvar-edit">Salvar</button>
            <button class="btn btn-outline" id="cancelar-edit">Cancelar</button>
          </td>
        `;
      } else {
        tr.innerHTML = `
          <td>${ev.data}</td>
          <td>${ev.publico}</td>
          <td>${ev.tipo}</td>
          <td>${ev.horario}</td>
          <td>${ev.fechamento||'-'}</td>
          <td>${ev.valor ? 'R$ ' + Number(ev.valor).toLocaleString('pt-BR') : '-'}</td>
          <td>
            <button class="btn btn-outline" data-edit="${idx}">Editar</button>
            <button class="btn btn-primary" data-del="${idx}">Deletar</button>
          </td>
        `;
      }
      tbody.appendChild(tr);
    });
    document.querySelectorAll('[data-edit]').forEach(btn => {
      btn.onclick = function() {
        editIndex = parseInt(btn.getAttribute('data-edit'));
        renderTabela();
      };
    });
    document.querySelectorAll('[data-del]').forEach(btn => {
      btn.onclick = function() {
        if (confirm('Deseja realmente deletar este evento?')) {
          eventos.splice(parseInt(btn.getAttribute('data-del')), 1);
          renderTabela();
          renderComissao();
        }
      };
    });
    const salvarBtn = document.getElementById('salvar-edit');
    const cancelarBtn = document.getElementById('cancelar-edit');
    if (salvarBtn) {
      salvarBtn.onclick = function() {
        const data = fromISO(document.getElementById('edit-data').value);
        const publico = Number(document.getElementById('edit-publico').value);
        const tipo = document.getElementById('edit-tipo').value;
        const horario = document.getElementById('edit-horario').value;
        const fechamento = document.getElementById('edit-fechamento').value;
        // --- CONFIGURAÇÃO DE VALORES BASE ---
        // Altere aqui o valor base da casa e o valor do buffet por pessoa:
        let valorBaseCasa = 10000; // Valor base da casa (R$)
        let valorBuffetPorPessoa = 200; // Valor do buffet por pessoa (R$)
        if (publico >= 100) valorBaseCasa = 15000;
        // --- FIM DA CONFIGURAÇÃO ---
        let valor = valorBaseCasa + publico * valorBuffetPorPessoa;
        // ---
        eventos[editIndex] = { data, publico, tipo, horario, valor, fechamento };
        editIndex = null;
        renderTabela();
        renderComissao();
      };
    }
    if (cancelarBtn) {
      cancelarBtn.onclick = function() {
        editIndex = null;
        renderTabela();
      };
    }
  }

  function renderComissao() {
    const comissaoInfo = document.getElementById('comissao-info');
    if (!comissaoInfo) return;
    const total = eventos.reduce((soma, ev) => soma + (Number(ev.valor)||0), 0);
    const comissao = total * 0.02;
    comissaoInfo.innerHTML = `Comissão da vendedora (2%): <span style="color:var(--gold,#c9a14a)">R$ ${comissao.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span> <br>Total de eventos fechados: <b>${eventos.length}</b>`;
  }

  // Adicionar evento
  document.getElementById('add-evento-form').onsubmit = function(e) {
    e.preventDefault();
    const data = fromISO(document.getElementById('add-data').value);
    const publico = Number(document.getElementById('add-publico').value);
    const tipo = document.getElementById('add-tipo').value;
    const horario = document.getElementById('add-horario').value;
    const fechamento = document.getElementById('add-fechamento').value;
    // --- CONFIGURAÇÃO DE VALORES BASE ---
    // Altere aqui o valor base da casa e o valor do buffet por pessoa:
    let valorBaseCasa = 10000; // Valor base da casa (R$)
    let valorBuffetPorPessoa = 200; // Valor do buffet por pessoa (R$)
    // Se público >= 100, valor base da casa é maior
    if (publico >= 100) valorBaseCasa = 15000;
    // --- FIM DA CONFIGURAÇÃO ---
    let valor = valorBaseCasa + publico * valorBuffetPorPessoa;
    // ---
    eventos.push({ data, publico, tipo, horario, valor, fechamento });
    renderTabela();
    renderComissao();
    this.reset();
  };

  // Carregar eventos do JSON ao iniciar
  fetch('datas_ocupadas.json')
    .then(resp => resp.json())
    .then(json => {
      eventos = json;
      renderTabela();
      renderComissao();
    })
    .catch(() => {
      document.getElementById('eventos-tbody').innerHTML = '<tr><td colspan="6" style="text-align:center; color:#b00;">Erro ao carregar eventos.</td></tr>';
    });

  // Alternância de abas
  const abaEventos = document.getElementById('aba-eventos');
  const abaComissoes = document.getElementById('aba-comissoes');
  const painelEventos = document.getElementById('painel-eventos');
  const painelComissoes = document.getElementById('painel-comissoes');
  if (abaEventos && abaComissoes && painelEventos && painelComissoes) {
    abaEventos.onclick = function() {
      painelEventos.style.display = '';
      painelComissoes.style.display = 'none';
      abaEventos.classList.add('btn-primary');
      abaEventos.classList.remove('btn-outline');
      abaComissoes.classList.remove('btn-primary');
      abaComissoes.classList.add('btn-outline');
    };
    abaComissoes.onclick = function() {
      window.location.href = 'comissoes.html';
    };
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

  // Filtros listeners
  const selFechamento = document.getElementById('filtro-fechamento');
  const selTipo = document.getElementById('filtro-tipo');
  if(selFechamento) selFechamento.onchange = renderTabela;
  if(selTipo) selTipo.onchange = renderTabela;
});
