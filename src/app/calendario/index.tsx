import React from "react";

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

export default function Calendario({ eventos }: { eventos: Evento[] }) {
    console.log(eventos);
	const now = new Date();
	const mesAtual = String(now.getMonth() + 1).padStart(2, '0');
	const anoAtual = String(now.getFullYear());
	const diasNoMes = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
	// Eventos do mês
	const eventosMes = eventos.filter(ev => {
		if (!ev.data) return false;
		let dia, mes, ano;
		if (ev.data.includes('/')) {
			// Formato dd/mm/yyyy
			[dia, mes, ano] = ev.data.split('/');
		} else if (ev.data.includes('-')) {
			// Formato yyyy-mm-dd
			[ano, mes, dia] = ev.data.split('-');
		} else {
			return false;
		}
		return mes === mesAtual && ano === anoAtual;
	});
	// Mapeia eventos por dia
	const eventosPorDia: { [dia: string]: Evento[] } = {};
	eventosMes.forEach(ev => {
		let dia: string | undefined;
		if (ev.data.includes('/')) {
			[dia] = ev.data.split('/');
		} else if (ev.data.includes('-')) {
			const parts = ev.data.split('-');
			dia = parts[2];
		}
		if (dia) {
			if (!eventosPorDia[dia]) eventosPorDia[dia] = [];
			eventosPorDia[dia].push(ev);
		}
	});
	// Renderiza calendário
	return (
		<div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
			{[...Array(diasNoMes)].map((_, i) => {
				const dia = String(i + 1).padStart(2, '0');
				const eventosDia = eventosPorDia[dia] || [];
				return (
					<div key={dia} style={{ background: '#222', borderRadius: 8, minHeight: 70, padding: 6, color: '#fff', boxShadow: eventosDia.length ? '0 0 8px #c9a14a' : 'none' }}>
						<div style={{ fontWeight: 'bold', color: eventosDia.length ? '#c9a14a' : '#fff' }}>{dia}</div>
						{eventosDia.map((ev, idx) => (
							<div key={idx} style={{ fontSize: '0.95rem', marginTop: 2, background: '#c9a14a22', borderRadius: 4, padding: '2px 4px' }}>
								<div><b>{ev.nome}</b> <span style={{ color: '#c9a14a' }}>({ev.tipo})</span></div>
								<div style={{ fontSize: '0.9rem', color: '#ffe066' }}>{ev.telefone}</div>
							</div>
						))}
					</div>
				);
			})}
		</div>
	);
}
