import React, { useEffect, useState } from "react";

type Lead = {
	nome: string;
	telefone: string;
	valor_evento: number;
	quantidade: number;
	data: string;
	horario: string;
	tipo: string;
};

export default function LeedTable() {
		const [leads, setLeads] = useState<Lead[]>([]);
		const [page, setPage] = useState(0);
		const itemsPerPage = 10;
		const paginatedLeads = leads.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

		async function handleEnviarParaEventos(idx: number) {
			const lead = leads[idx];
			const evento = {
				data: lead.data,
				publico: lead.quantidade,
				tipo: lead.tipo,
				horario: lead.horario,
				fechamento: 'lead convertido',
				valor: lead.valor_evento,
				telefone: lead.telefone,
				nome: lead.nome,
				vendedor: ''
			};
			await fetch('/api/datas_ocupadas', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(evento)
			});
			await fetch('/api/leed', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ idx })
			});
			setLeads(leads => leads.filter((_, i) => i !== idx));
		}

		useEffect(() => {
			fetch("/api/leed")
				.then((resp) => resp.json())
				.then((json) => setLeads(json));
		}, []);

		// ...existing code...
			function handleDelete(idx: number) {
				if (window.confirm('Deseja deletar este lead?')) {
					fetch('/api/leed', {
						method: 'DELETE',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ idx })
					})
						.then(() => setLeads(leads => leads.filter((_, i) => i !== idx)));
				}
			}

			return (
				<div style={{ padding: 24 }}>
					<h2 style={{ fontSize: "1.2rem", marginBottom: 16 }}>Leads recebidos</h2>
					{leads.length === 0 ? (
						<div style={{ color: '#aaa', textAlign: 'center' }}>Nenhum lead recebido.</div>
					) : (
						<>
							<table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff1', borderRadius: 8 }}>
								<thead>
									<tr style={{ background: '#c9a14a', color: '#fff' }}>
										<th>Nome</th>
										<th>Telefone</th>
										<th>Valor</th>
										<th>Qtd</th>
										<th>Data</th>
										<th>Horário</th>
										<th>Tipo</th>
										<th>Ações</th>
									</tr>
								</thead>
								<tbody>
									{paginatedLeads.map((lead, idx) => {
										const realIdx = page * itemsPerPage + idx;
										return (
											<tr key={realIdx}>
												<td>{lead.nome}</td>
												<td>{lead.telefone}</td>
												<td>{lead.valor_evento ? `R$ ${Number(lead.valor_evento).toLocaleString('pt-BR')}` : '-'}</td>
												<td>{lead.quantidade}</td>
												<td>{lead.data ? new Date(lead.data).toLocaleDateString('pt-BR') : '-'}</td>
												<td>{lead.horario}</td>
												<td>{lead.tipo}</td>
												<td>
																			<button onClick={() => handleDelete(realIdx)} style={{ marginRight: 8, color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }} aria-label="Deletar">
																				<span role="img" aria-label="lixeira" style={{ fontSize: '1.2em', verticalAlign: 'middle' }}>🗑️</span>
																			</button>
																			<button onClick={() => handleEnviarParaEventos(realIdx)} style={{  color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }} aria-label="Enviar para eventos">
																				<span role="img" aria-label="avião de papel" style={{ fontSize: '1.2em', verticalAlign: 'middle' }}>🛩️</span>
																			</button>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
							<div style={{ marginTop: 16, textAlign: 'center' }}>
								<button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ marginRight: 8 }}>Anterior</button>
								<span>Página {page + 1} de {Math.ceil(leads.length / itemsPerPage)}</span>
								<button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * itemsPerPage >= leads.length} style={{ marginLeft: 8 }}>Próxima</button>
							</div>
						</>
					)}
				</div>
			);
}
