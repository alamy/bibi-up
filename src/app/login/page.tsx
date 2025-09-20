"use client";
import React, { useState } from "react";
import './style.css'

export default function LoginPage() {
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    if (!nome || !senha) {
      setErro("Preencha todos os campos.");
      setLoading(false);
      return;
    }
    try {
      const resp = await fetch("/db/user.json");
      const data = await resp.json();
      console.log(data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = data.users.find((u:any) => u.nome === nome && u.senha === senha);
      if (user) {
        setErro("");
        // Salva autenticação simples
        localStorage.setItem('auth', 'true');
        window.location.href = '/dashboard';
      } else {
        setErro("Usuário ou senha inválidos.");
      }
    } catch {
      setErro("Erro ao acessar banco de dados.");
    }
    setLoading(false);
  }

  return (
    <main className="login-main">
      <div className="login-container">
        <h1 className="login-title">Login</h1>
        <form className="login-form" onSubmit={handleLogin} autoComplete="off">
          <input
            type="text"
            placeholder="Usuário"
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="login-input"
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            className="login-input"
            autoComplete="current-password"
          />
          {erro && <div className="login-error">{erro}</div>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
