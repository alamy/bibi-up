"use client";
import React, { useState, useEffect } from 'react';
import './style.css'

const PHONE_NUMBER = "5581996241204";
const MIN_CONVIDADOS = 70;
const MAX_CONVIDADOS = 150;

function formatarValor(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calcularValor(convidados: number) {
  const aluguel = convidados >= 100 ? 15000 : 10000;
  if (convidados < MIN_CONVIDADOS) convidados = MIN_CONVIDADOS;
  if (convidados > MAX_CONVIDADOS) convidados = MAX_CONVIDADOS;
  return aluguel + (convidados * 200);
}

function validarTelefone(valor: string) {
  return /^\(\d{2}\) \d{5}-\d{4}$/.test(valor);
}

function aplicarMascaraTelefone(valor: string) {
  let v = valor.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 6) {
    return `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
  } else if (v.length > 2) {
    return `(${v.slice(0,2)}) ${v.slice(2)}`;
  } else if (v.length > 0) {
    return `(${v}`;
  } else {
    return '';
  }
}

export default function InicialPage() {
  const [convidados, setConvidados] = useState(MIN_CONVIDADOS);
  const [valorTotal, setValorTotal] = useState(calcularValor(MIN_CONVIDADOS));
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    message: '',
  });
  const [phoneError, setPhoneError] = useState('');
  const [dateError, setDateError] = useState('');
  const [copyMsg, setCopyMsg] = useState('Copiar mensagem');
  const [datasOcupadas, setDatasOcupadas] = useState<string[]>([]);

  useEffect(() => {
    setValorTotal(calcularValor(convidados));
  }, [convidados]);

  useEffect(() => {
    fetch('/datas_ocupadas.json')
      .then(resp => resp.json())
      .then(json => {
        const datas = json.map((item: { data: string }) => {
          const [dia, mes, ano] = item.data.split('/');
          return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        });
        setDatasOcupadas(datas);
      });
  }, []);

  function buildMessage() {
    const lines = [];
    lines.push("Solicitação de Proposta - BibiApp");
    if (form.name) lines.push(`Nome: ${form.name}`);
    if (form.email) lines.push(`E-mail: ${form.email}`);
    if (form.phone) lines.push(`Telefone: ${form.phone}`);
    if (form.date) lines.push(`Data prevista: ${form.date}`);
    if (form.message) lines.push(`Detalhes: ${form.message}`);
    lines.push("");
    lines.push("Endereço: Av. Rui Barbosa, 141 — Graças, Recife - PE");
    lines.push("Por favor, responda com disponibilidade e opções de pacote.");
    return lines.join("\n");
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    if (name === 'phone') {
      setForm(f => ({ ...f, phone: aplicarMascaraTelefone(value) }));
      setPhoneError('');
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setForm(f => ({ ...f, date: value }));
    if (datasOcupadas.includes(value)) {
      setDateError('Esta data já está reservada para outro evento.');
    } else {
      setDateError('');
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) {
      alert('Por favor, preencha pelo menos nome e e-mail.');
      return;
    }
    if (!validarTelefone(form.phone)) {
      setPhoneError('Digite um telefone válido no formato (99) 99999-9999.');
      return;
    }
    if (!form.date) {
      setDateError('Escolha uma data válida para o evento.');
      return;
    }
    if (datasOcupadas.includes(form.date)) {
      setDateError('Esta data já está reservada para outro evento. Por favor, escolha outra.');
      return;
    }
    const dataObj = new Date(form.date);
    const hoje = new Date();
    if (dataObj < hoje) {
      setDateError('Escolha uma data futura.');
      return;
    }
    if (dataObj.getFullYear() > 2999) {
      setDateError('Ano inválido. Escolha uma data antes do ano 3000.');
      return;
    }
    const msg = buildMessage();
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encoded}`, '_blank');
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildMessage()).then(() => {
      setCopyMsg('Copiado!');
      setTimeout(() => setCopyMsg('Copiar mensagem'), 1800);
    });
  }

  // Data mínima do calendário
  const hoje = new Date();
  const minDate = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')}`;

  return (
    <div className="main-bg">
       
      <header className="header-bg">
        <div className="header-overlay" />
        
        <div className="header-content">
          <h1 className="header-title">Eventos sofisticados<br />e memoráveis</h1>
          <p className="header-desc">Casamentos, aniversários de 15 anos e eventos corporativos luxuosos no coração das Graças.</p>
          <div className="header-actions">
            <a href="#sobre" className="btn-outline-gold">Conheça o espaço</a>
            <a href="#contato" className="btn-gold">Solicitar proposta</a>
          </div>
        </div>
      </header>
      <main className="main-container">
        <section id="sobre" className="section-sobre">
          <div className="destaque">
            <h2 className="destaque-title">Um cenário singular para seu evento</h2>
            <p className="destaque-desc">Localizado na Av. Rui Barbosa, 141 — Graças, Recife — o BibiApp reúne arquitetura acolhedora, iluminação natural e acabamento de alto padrão. Perfeito para cerimônias e recepções intimistas que exigem sofisticação e calor humano.</p>
          </div>
          <div className="galeria-carousel">
            <img src="/img/galeria.jpg" alt="Ambiente BibiApp" className="galeria-img" />
            <img src="/img/galeria2.jpg" alt="Ambiente 2" className="galeria-img" />
            <img src="/img/galeria3.jpg" alt="Ambiente 3" className="galeria-img" />
          </div>
          <div className="box-carousel">
            <div className="box-item">
              <div className="box-title">Gastronomia assinada</div>
              <div className="box-desc">Menus personalizados, degustação e serviço de alta gastronomia.</div>
            </div>
            <div className="box-item">
              <div className="box-title">Espaço versátil</div>
              <div className="box-desc">Integração entre área interna e pátio, para cerimônias ao ar livre ou climatizadas.</div>
            </div>
            <div className="box-item">
              <div className="box-title">Assessoria dedicada</div>
              <div className="box-desc">Equipe especializada para planejamento, montagem e coordenação no dia.</div>
            </div>
          </div>
        </section>
        <section style={{ background: '#0f1724', color: '#fff', textAlign: 'center', borderRadius: 16, margin: '24px 0', padding: 32, boxShadow: '0 8px 32px rgba(15,23,36,0.10)' }}>
          <h3 style={{ fontSize: 18, marginBottom: 8, color: '#fff', fontWeight: 700, letterSpacing: 0.5 }}>Transforme seu sonho em realidade</h3>
          <p style={{ color: '#d1d5db', fontSize: 15, marginBottom: 18 }}>Solicite uma proposta personalizada. Nossos pacotes contemplam gastronomia, décor, mobiliário e coordenação do dia.</p>
          <a href="#contato" style={{ borderRadius: 999, padding: '10px 18px', fontWeight: 700, fontSize: 15, background: '#c9a14a', color: '#0f1724', border: 'none', textDecoration: 'none', marginTop: 8, display: 'inline-block', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>Solicitar proposta</a>
        </section>
        <section id="contato" style={{ margin: '32px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'stretch', justifyContent: 'center' }}>
            <section style={{ width: '100%', minWidth: 0 }} aria-labelledby="form-title">
              <h2 id="form-title" style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#0f1724', marginBottom: 8 }}>Solicitar Proposta</h2>
              <p style={{ color: '#6b7280', fontSize: 15, marginBottom: 10 }}>Preencha o formulário abaixo e envie sua solicitação direto pelo WhatsApp.</p>
              <form onSubmit={handleSubmit} style={{ width: '100%', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(15,23,36,0.07)', padding: 20, marginBottom: 8 }}>
                <label htmlFor="name" style={{ fontWeight: 600, fontSize: 15 }}>Nome completo</label>
                <input type="text" id="name" name="name" value={form.name} onChange={handleFormChange} required autoComplete="name" style={{ marginBottom: 10, width: '100%', fontSize: 15, borderRadius: 10, border: '1.5px solid #e6e7eb', padding: '12px 14px' }} />
                <label htmlFor="email" style={{ fontWeight: 600, fontSize: 15 }}>E-mail</label>
                <input type="email" id="email" name="email" value={form.email} onChange={handleFormChange} required autoComplete="email" style={{ marginBottom: 10, width: '100%', fontSize: 15, borderRadius: 10, border: '1.5px solid #e6e7eb', padding: '12px 14px' }} />
                <label htmlFor="phone" style={{ fontWeight: 600, fontSize: 15 }}>Telefone (com DDD)</label>
                <input type="tel" id="phone" name="phone" value={form.phone} onChange={handleFormChange} pattern="\(\d{2}\) \d{5}-\d{4}" inputMode="numeric" maxLength={15} style={{ marginBottom: 4, width: '100%', fontSize: 15, borderRadius: 10, border: '1.5px solid #e6e7eb', padding: '12px 14px' }} />
                {phoneError && <div style={{ color: '#c0392b', fontSize: 13, marginBottom: 8 }}>{phoneError}</div>}
                <label htmlFor="date" style={{ fontWeight: 600, fontSize: 15 }}>Data prevista</label>
                <input type="date" id="date" name="date" value={form.date} onChange={handleDateChange} min={minDate} max="2999-12-31" style={{ marginBottom: 4, width: '100%', fontSize: 15, borderRadius: 10, border: '1.5px solid #e6e7eb', padding: '12px 14px' }} />
                {dateError && <div style={{ color: '#c0392b', fontSize: 13, marginBottom: 8 }}>{dateError}</div>}
                <label htmlFor="message" style={{ fontWeight: 600, fontSize: 15 }}>Nos conte sobre o seu evento (nº convidados, estilo, orçamento aproximado)</label>
                <textarea id="message" name="message" value={form.message} onChange={handleFormChange} rows={4} style={{ marginBottom: 10, width: '100%', fontSize: 15, borderRadius: 10, border: '1.5px solid #e6e7eb', padding: '12px 14px' }} />
                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <button type="submit" style={{ flex: 1, background: '#c9a14a', color: '#0f1724', borderRadius: 999, padding: '12px 0', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', minWidth: 120 }}>Enviar via WhatsApp</button>
                  <button type="button" onClick={handleCopy} style={{ flex: 1, background: '#0f1724', color: '#fff', borderRadius: 999, padding: '12px 0', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', minWidth: 120 }}>{copyMsg}</button>
                </div>
                <p style={{ color: '#6b7280', fontSize: 13, marginTop: 8 }}>Ao clicar em enviar, o WhatsApp será aberto com a mensagem preenchida para o número do BibiApp.</p>
              </form>
            </section>
            <aside aria-labelledby="gabi-title" style={{ width: '100%', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(15,23,36,0.07)', padding: '20px 12px', marginTop: 8, textAlign: 'center' }} role="region">
              <h3 id="gabi-title" style={{ marginTop: 0, fontSize: 16, color: '#0f1724', fontWeight: 700 }}>Simulador de valor do evento <span style={{ fontSize: '0.8em', color: '#c9a14a' }}>(IA do BibiApp)</span></h3>
              <label htmlFor="gabi-convidados" style={{ fontWeight: 600, fontSize: 15, color: '#0f1724' }}>Quantos convidados?</label>
              <input type="number" id="gabi-convidados" min={MIN_CONVIDADOS} max={MAX_CONVIDADOS} value={convidados} onChange={e => {
                let v = parseInt(e.target.value, 10) || MIN_CONVIDADOS;
                if (v < MIN_CONVIDADOS) v = MIN_CONVIDADOS;
                if (v > MAX_CONVIDADOS) v = MAX_CONVIDADOS;
                setConvidados(v);
              }} style={{ width: '100%', margin: '10px 0 18px 0', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e6e7eb', fontSize: '1em' }} />
              <div style={{ fontSize: '1.2em', fontWeight: 700, color: '#0f1724', marginTop: 10 }}>Valor total: {formatarValor(valorTotal)}</div>
              <p style={{ color: '#6b7280', fontSize: '0.98em', marginTop: 18 }}>O simulador calcula o valor total do evento conforme o número de convidados. Mínimo 70, máximo 150.</p>
            </aside>
          </div>
        </section>
      </main>
      <footer style={{ padding: '24px 0', borderTop: '1px solid #f1f3f5', marginTop: 32, background: '#fff', borderRadius: '0 0 18px 18px', boxShadow: '0 -2px 12px rgba(15,23,36,0.04)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, color: '#0f1724', fontSize: 15 }}>BibiApp</div>
          <div style={{ color: '#6b7280', fontSize: 14 }}>Av. Rui Barbosa, 141 — Graças, Recife - PE</div>
          <div style={{ color: '#6b7280', fontSize: 14 }}>Tel: (xx) xxxx-xxxx — Instagram: @bibiapp</div>
          <div style={{ color: '#6b7280', fontSize: 13 }}>© {new Date().getFullYear()} BibiApp</div>
        </div>
      </footer>
    </div>
  );
}
