"use client";
import React, { useEffect, useState } from "react";
import './style.css'
import Calendario from '../calendario';

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
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Meu Evento</h1>
          <div style={{ fontSize: "1rem", color: "#c9a14a", fontWeight: "bold" }}>Usuário: {usuario.username} ({usuario.role})</div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="logout" onClick={handleLogout} style={{ background: "#c9a14a", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: "bold" }}>Logout</button>
          <button onClick={handleResetBanco} style={{ background: "#b00", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: "bold" }}>Reset Banco</button>
        </div>
      </header>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: 8 }}>Cadastrar evento</h2>
        <form onSubmit={handleAddEvento} className="form-cadastro">
          <input type="date" required value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} style={{ flex: 1 }} />
          <input type="number" required min={1} max={300} placeholder="Público" value={form.publico} onChange={e => setForm({ ...form, publico: Number(e.target.value) })} style={{ flex: 1 }} />
          <input type="text" required placeholder="Nome do cliente" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} style={{ flex: 1 }} />
          <input type="tel" required placeholder="Telefone" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} style={{ flex: 1 }} />
          <input type="number" min={0} placeholder="Valor do evento (opcional)" value={form.valor || ""} onChange={e => setForm({ ...form, valor: Number(e.target.value) })} style={{ flex: 1 }} />
          <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} style={{ flex: 1 }}>
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={form.horario} onChange={e => setForm({ ...form, horario: e.target.value })} style={{ flex: 1 }}>
            {horarios.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          <select value={form.fechamento} onChange={e => setForm({ ...form, fechamento: e.target.value })} style={{ flex: 1 }}>
            {fechamentos.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <button type="submit" style={{ background: "#c9a14a", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: "bold" }}>Adicionar</button>
        </form>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: 8 }}>Filtros</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select value={filtroFechamento} onChange={e => setFiltroFechamento(e.target.value)}>
            <option value="">Todos fechamentos</option>
            {fechamentos.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
            <option value="">Todos tipos</option>
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)}>
            <option value="">Todos meses</option>
            {meses.map((m, i) => <option key={m} value={m}>{nomesMeses[i]}</option>)}
          </select>
          <select value={filtroAno} onChange={e => setFiltroAno(e.target.value)}>
            <option value="">Todos anos</option>
            {anosPresentes.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: 8 }}>Eventos</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff1", borderRadius: 8 }}>
          <thead>
            <tr style={{ background: "#c9a14a", color: "#fff" }}>
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
              <tr><td colSpan={7} style={{ textAlign: "center", color: "#aaa" }}>Nenhum evento cadastrado.</td></tr>
            ) : eventosFiltrados.map((ev) => {
              const globalIdx = eventos.findIndex(e => e === ev);
              if (editIndex === globalIdx) {
                return (
                  <tr key={globalIdx} style={{ background: "#fff6" }}>
                    <td><input type="date" value={ev.data} onChange={e => {
                      const novosEventos = [...eventos];
                      novosEventos[globalIdx].data = e.target.value;
                      setEventos(novosEventos);
                    }} /></td>
                    <td><input type="number" min={1} max={300} value={ev.publico} onChange={e => {
                      const novosEventos = [...eventos];
                      novosEventos[globalIdx].publico = Number(e.target.value);
                      setEventos(novosEventos);
                    }} /></td>
                    <td><input type="text" value={ev.nome || ""} onChange={e => {
                      const novosEventos = [...eventos];
                      novosEventos[globalIdx].nome = e.target.value;
                      setEventos(novosEventos);
                    }} /></td>
                    <td><input type="tel" value={ev.telefone || ""} onChange={e => {
                      const novosEventos = [...eventos];
                      novosEventos[globalIdx].telefone = e.target.value;
                      setEventos(novosEventos);
                    }} /></td>
                    <td><select value={ev.tipo} onChange={e => {
                      const novosEventos = [...eventos];
                      novosEventos[globalIdx].tipo = e.target.value;
                      setEventos(novosEventos);
                    }}>{tipos.map(t => <option key={t} value={t}>{t}</option>)}</select></td>
                    <td><select value={ev.horario} onChange={e => {
                      const novosEventos = [...eventos];
                      novosEventos[globalIdx].horario = e.target.value;
                      setEventos(novosEventos);
                    }}>{horarios.map(h => <option key={h} value={h}>{h}</option>)}</select></td>
                    <td><select value={ev.fechamento} onChange={e => {
                      const novosEventos = [...eventos];
                      novosEventos[globalIdx].fechamento = e.target.value;
                      setEventos(novosEventos);
                    }}>{fechamentos.map(f => <option key={f} value={f}>{f}</option>)}</select></td>
                    <td><input type="number" min={0} value={ev.valor || ""} onChange={e => {
                      const novosEventos = [...eventos];
                      novosEventos[globalIdx].valor = Number(e.target.value);
                      setEventos(novosEventos);
                    }} /></td>
                    <td>
                      <button onClick={() => handleSaveEdit(globalIdx)} style={{ background: "#c9a14a", color: "#fff", border: "none", padding: "4px 8px", borderRadius: 6, fontWeight: "bold", marginRight: 4 }}>Salvar</button>
                      <button onClick={handleCancelEdit} style={{ background: "#fff", color: "#c9a14a", border: "1px solid #c9a14a", padding: "4px 8px", borderRadius: 6, fontWeight: "bold" }}>Cancelar</button>
                    </td>
                  </tr>
                );
              } else {
                return (
                  <tr key={globalIdx}>
                    <td>{ev.data}</td>
                    <td>{ev.publico}</td>
                    <td>{ev.nome}</td>
                    <td>{ev.telefone}</td>
                    <td>{ev.tipo}</td>
                    <td>{ev.horario}</td>
                    <td>{ev.fechamento}</td>
                    <td>{ev.valor ? `R$ ${Number(ev.valor).toLocaleString("pt-BR")}` : "-"}</td>
                    {usuario.role === "gerente" && <td>{ev.vendedor}</td>}
                    <td>
                      <button onClick={() => handleEditEvento(globalIdx)} style={{ background: "#fff", color: "#c9a14a", border: "1px solid #c9a14a", padding: "4px 8px", borderRadius: 6, fontWeight: "bold", marginRight: 4 }}>Editar</button>
                      <button onClick={() => handleDeleteEvento(globalIdx)} style={{ background: "#c9a14a", color: "#fff", border: "none", padding: "4px 8px", borderRadius: 6, fontWeight: "bold" }}>Deletar</button>
                    </td>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: 8 }}>Comissão</h2>
        <div id="comissao-info" style={{ fontWeight: "bold", color: "#c9a14a", fontSize: "1.1rem" }}>
          Comissão da vendedora (2%): <span style={{ color: "var(--gold,#c9a14a)" }}>R$ {comissao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span><br />
          Total de eventos fechados: <b>{eventos.length}</b>
        </div>
      </section>

      {/* Calendário do mês atual */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: 8 }}>Calendário do mês</h2>
        <div style={{ background: "#181818", borderRadius: 10, padding: 16, boxShadow: "0 2px 8px #0002" }}>
          <Calendario eventos={eventos} />
        </div>
      </section>
    </main>
  );
}


