"use client";
import React, { useEffect, useState } from "react";
import './style.css'
import Calendario from '../calendario';
import LeedTable from '../leed';

const tipos = ["casa exclusiva", "salão", "outro"];
const horarios = ["vespertino", "noturno"];
const fechamentos = ["cliente em potencial", "cliente prospectado", "cliente faturado"];

type Evento = {
  data: string;
  publico: number;
  tipo: string;
  horario: string;
  fechamento: string;
  valor?: number;
  telefone?: string;
  nome?: string;
  vendedor?: string;
};

export default function DashboardPage() {
  const [eventosPage, setEventosPage] = useState(0);
  const eventosPerPage = 10;
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [filtroFechamento, setFiltroFechamento] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroAno, setFiltroAno] = useState("");
  const [form, setForm] = useState<Omit<Evento, "valor"> & { valor?: number; telefone?: string; nome?: string }>({
    data: "",
    publico: 0,
    tipo: tipos[0],
    horario: horarios[0],
    fechamento: fechamentos[0],
    valor: undefined,
    telefone: "",
    nome: ""
  });
  const [usuario, setUsuario] = useState<{ username: string; role: string }>({ username: "", role: "vendedor" });

  // Recuperar usuário logado
  useEffect(() => {
    if (typeof window !== "undefined") {
      const username = localStorage.getItem("username") || "";
      const role = localStorage.getItem("role") || "vendedor";
      setUsuario({ username, role });
    }
  }, []);

  // Proteção de rota
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("auth");
      if (auth !== "true") {
        window.location.href = "/login";
      }
    }
  }, []);

  // Carregar eventos do JSON
  useEffect(() => {
    fetch("/api/eventos")
      .then((resp) => resp.json())
      .then((json) => setEventos(json));
  }, []);

  // Filtros por mês/ano
  const meses = [
    "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"
  ];
  const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  // Descobrir anos presentes
  const anosPresentes = Array.from(new Set(eventos.map(ev => ev.data.split("/")[2]))).sort();
  // Filtro principal
  const eventosFiltrados = eventos.filter((ev) => {
    let ok = true;
    if (filtroFechamento && ev.fechamento !== filtroFechamento) ok = false;
    if (filtroTipo && ev.tipo !== filtroTipo) ok = false;
    if (filtroMes && ev.data.split("/")[1] !== filtroMes) ok = false;
    if (filtroAno && ev.data.split("/")[2] !== filtroAno) ok = false;
    // Vendedor só vê seus eventos
    if (usuario.role !== "gerente" && ev.vendedor !== usuario.username) ok = false;
    return ok;
  });

  const paginatedEventos = eventosFiltrados.slice(eventosPage * eventosPerPage, (eventosPage + 1) * eventosPerPage);

  // Adicionar evento
  async function handleAddEvento(e: { preventDefault: () => void; }) {
    e.preventDefault();
    let valor = form.valor;
    if (!valor || valor <= 0) {
      let valorBaseCasa = 10000;
      const valorBuffetPorPessoa = 200;
      if (Number(form.publico) >= 100) valorBaseCasa = 15000;
      valor = valorBaseCasa + Number(form.publico) * valorBuffetPorPessoa;
    }
    const novoEvento = { ...form, valor: valor, publico: Number(form.publico), vendedor: usuario.username };
    // Cadastrar no banco via API
    const resp = await fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoEvento)
    });
    if (resp.ok) {
      // Atualizar lista local
      setEventos([...eventos, novoEvento]);
      setForm({
        data: "",
        publico: 0,
        tipo: tipos[0],
        horario: horarios[0],
        fechamento: fechamentos[0],
        valor: undefined,
        telefone: "",
        nome: ""
      });
    } else {
      alert("Erro ao cadastrar evento!");
    }
  }

  // Editar evento
  function handleEditEvento(idx: React.SetStateAction<number | null>) {
    setEditIndex(idx);
  }
  function handleSaveEdit(idx: number) {
    const novosEventos = [...eventos];
    let valor = novosEventos[idx].valor;
    if (!valor || valor <= 0) {
      let valorBaseCasa = 10000;
      const valorBuffetPorPessoa = 200;
      if (Number(novosEventos[idx].publico) >= 100) valorBaseCasa = 15000;
      valor = valorBaseCasa + Number(novosEventos[idx].publico) * valorBuffetPorPessoa;
    }
    novosEventos[idx].valor = valor;
    setEventos(novosEventos);
    setEditIndex(null);
  }
  function handleCancelEdit() {
    setEditIndex(null);
  }
  function handleDeleteEvento(idx: number) {
    if (window.confirm("Deseja realmente deletar este evento?")) {
      setEventos(eventos.filter((_, i) => i !== idx));
    }
  }

  // Comissão
  const total = eventos.reduce((soma, ev) => soma + (Number(ev.valor) || 0), 0);
  const comissao = total * 0.02;

  // Logout
  function handleLogout() {
    localStorage.removeItem("auth");
    window.location.href = "/login";
  }

  // Reset banco
  async function handleResetBanco() {
    const senha = window.prompt("Digite a senha para resetar o banco:");
    if (senha !== "0987") {
      alert("Senha incorreta. Operação cancelada.");
      return;
    }
    const resp = await fetch("/api/eventos/reset", { method: "POST" });
    if (resp.ok) {
      alert("Banco resetado com sucesso!");
      setEventos([]);
    } else {
      alert("Erro ao resetar banco.");
    }
  }

  return (
    <main className="dashboard-main">
      <header className="dashboard-header">
        <div className="dashboard-header-info">
          <h1 className="dashboard-title">Meu Evento</h1>
          <div className="dashboard-user">Usuário: {usuario.username} ({usuario.role})</div>
        </div>
        <div className="dashboard-header-actions">
          <button className="logout" onClick={handleLogout}>Logout</button>
          <button className="reset-banco" onClick={handleResetBanco}>Reset Banco</button>
        </div>
      </header>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">Cadastrar evento</h2>
        <form onSubmit={handleAddEvento} className="form-cadastro">
          <input type="date" required value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} className="form-input" />
          <input type="number" required min={1} max={300} placeholder="Público" value={form.publico} onChange={e => setForm({ ...form, publico: Number(e.target.value) })} className="form-input" />
          <input type="text" required placeholder="Nome do cliente" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="form-input" />
          <input type="tel" required placeholder="Telefone" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} className="form-input" />
          <input type="number" min={0} placeholder="Valor do evento (opcional)" value={form.valor || ""} onChange={e => setForm({ ...form, valor: Number(e.target.value) })} className="form-input" />
          <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} className="form-input">
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={form.horario} onChange={e => setForm({ ...form, horario: e.target.value })} className="form-input">
            {horarios.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          <select value={form.fechamento} onChange={e => setForm({ ...form, fechamento: e.target.value })} className="form-input">
            {fechamentos.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <button type="submit" className="btn-adicionar">Adicionar</button>
        </form>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">Filtros</h2>
        <div className="dashboard-filtros">
          <select value={filtroFechamento} onChange={e => setFiltroFechamento(e.target.value)} className="form-input">
            <option value="">Todos fechamentos</option>
            {fechamentos.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="form-input">
            <option value="">Todos tipos</option>
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)} className="form-input">
            <option value="">Todos meses</option>
            {meses.map((m, i) => <option key={m} value={m}>{nomesMeses[i]}</option>)}
          </select>
          <select value={filtroAno} onChange={e => setFiltroAno(e.target.value)} className="form-input">
            <option value="">Todos anos</option>
            {anosPresentes.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">Eventos</h2>
        <div className="dashboard-table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr className="dashboard-table-header">
                <th>Data</th>
                <th>Público</th>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Tipo</th>
                <th>Horário</th>
                <th>Fechamento</th>
                <th>Valor</th>
                {usuario.role === "gerente" && <th>Vendedor</th>}
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {eventosFiltrados.length === 0 ? (
                <tr><td colSpan={7} className="dashboard-table-empty">Nenhum evento cadastrado.</td></tr>
              ) : paginatedEventos.map((ev) => {
                const globalIdx = eventos.findIndex(e => e === ev);
                if (editIndex === globalIdx) {
                  return (
                    <tr key={globalIdx} className="dashboard-table-edit-row">
                      <td><input type="date" value={ev.data} onChange={e => {
                        const novosEventos = [...eventos];
                        novosEventos[globalIdx].data = e.target.value;
                        setEventos(novosEventos);
                      }} className="form-input" /></td>
                      <td><input type="number" min={1} max={300} value={ev.publico} onChange={e => {
                        const novosEventos = [...eventos];
                        novosEventos[globalIdx].publico = Number(e.target.value);
                        setEventos(novosEventos);
                      }} className="form-input" /></td>
                      <td><input type="text" value={ev.nome || ""} onChange={e => {
                        const novosEventos = [...eventos];
                        novosEventos[globalIdx].nome = e.target.value;
                        setEventos(novosEventos);
                      }} className="form-input" /></td>
                      <td><input type="tel" value={ev.telefone || ""} onChange={e => {
                        const novosEventos = [...eventos];
                        novosEventos[globalIdx].telefone = e.target.value;
                        setEventos(novosEventos);
                      }} className="form-input" /></td>
                      <td><select value={ev.tipo} onChange={e => {
                        const novosEventos = [...eventos];
                        novosEventos[globalIdx].tipo = e.target.value;
                        setEventos(novosEventos);
                      }} className="form-input">{tipos.map(t => <option key={t} value={t}>{t}</option>)}</select></td>
                      <td><select value={ev.horario} onChange={e => {
                        const novosEventos = [...eventos];
                        novosEventos[globalIdx].horario = e.target.value;
                        setEventos(novosEventos);
                      }} className="form-input">{horarios.map(h => <option key={h} value={h}>{h}</option>)}</select></td>
                      <td><select value={ev.fechamento} onChange={e => {
                        const novosEventos = [...eventos];
                        novosEventos[globalIdx].fechamento = e.target.value;
                        setEventos(novosEventos);
                      }} className="form-input">{fechamentos.map(f => <option key={f} value={f}>{f}</option>)}</select></td>
                      <td><input type="number" min={0} value={ev.valor || ""} onChange={e => {
                        const novosEventos = [...eventos];
                        novosEventos[globalIdx].valor = Number(e.target.value);
                        setEventos(novosEventos);
                      }} className="form-input" /></td>
                      <td>
                        <button onClick={() => handleSaveEdit(globalIdx)} className="btn-salvar">Salvar</button>
                        <button onClick={handleCancelEdit} className="btn-cancelar">Cancelar</button>
                      </td>
                    </tr>
                  );
                } else {
                  return (
                    <tr key={globalIdx} className="dashboard-table-row">
                      <td>{ev.data ? new Date(ev.data).toLocaleDateString('pt-BR') : '-'}</td>
                      <td>{ev.publico}</td>
                      <td>{ev.nome}</td>
                      <td>{ev.telefone}</td>
                      <td>{ev.tipo}</td>
                      <td>{ev.horario}</td>
                      <td>{ev.fechamento}</td>
                      <td>{ev.valor ? `R$ ${Number(ev.valor).toLocaleString("pt-BR")}` : "-"}</td>
                      {usuario.role === "gerente" && <td>{ev.vendedor}</td>}
                      <td>
                        <button onClick={() => handleEditEvento(globalIdx)} className="btn-editar">Editar</button>
                        <button onClick={() => handleDeleteEvento(globalIdx)} className="btn-deletar">Deletar</button>
                      </td>
                    </tr>
                  );
                }
              })}
        <div className="dashboard-pagination">
          <button onClick={() => setEventosPage(p => Math.max(0, p - 1))} disabled={eventosPage === 0} className="btn-paginacao">Anterior</button>
          <span className="dashboard-pagination-info">Página {eventosPage + 1} de {Math.ceil(eventosFiltrados.length / eventosPerPage)}</span>
          <button onClick={() => setEventosPage(p => p + 1)} disabled={(eventosPage + 1) * eventosPerPage >= eventosFiltrados.length} className="btn-paginacao">Próxima</button>
        </div>
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">Comissão</h2>
        <div id="comissao-info" className="dashboard-comissao-info">
          Comissão da vendedora (2%): <span className="dashboard-comissao-valor">R$ {comissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span><br />
          Total de eventos fechados: <b>{eventos.length}</b>
        </div>
      </section>

      {/* Calendário do mês atual */}
      <section className="dashboard-section-calendario">
        <h2 className="dashboard-section-title">Calendário do mês</h2>
        <div className="dashboard-calendario-wrapper">
          <Calendario eventos={eventos} />
        </div>
      </section>

      {/* Leads recebidos */}
      <LeedTable />
    </main>
  );
}


