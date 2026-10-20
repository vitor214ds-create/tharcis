export type Role = "admin" | "advogado" | "assistente" | "estagiario";
export const ROLE_LABEL: Record<Role, string> = { admin: "Administrador", advogado: "Advogado(a)", assistente: "Assistente", estagiario: "Estagiário(a)" };

export const APPT_KIND: Record<string, string> = { audiencia: "Audiência", reuniao: "Reunião", consulta: "Consulta", outro: "Outro" };
export const APPT_STATUS: Record<string, string> = { agendado: "Agendado", concluido: "Concluído", desmarcado: "Desmarcado" };
export const PRIORITY: Record<string, string> = { baixa: "Baixa", media: "Média", alta: "Alta", urgente: "Urgente" };
export const PRIORITY_RANK: Record<string, number> = { urgente: 0, alta: 1, media: 2, baixa: 3 };
export const PETITION_STATUS: Record<string, string> = {
  a_iniciar: "A iniciar", em_elaboracao: "Em elaboração", aguardando_revisao: "Aguardando revisão",
  pronta_protocolo: "Pronta para protocolo", protocolada: "Protocolada", concluida: "Concluída",
};
export const PETITION_ORDER = Object.keys(PETITION_STATUS);
export const TASK_STATUS: Record<string, string> = { pendente: "Pendente", em_andamento: "Em andamento", concluida: "Concluída" };
export const CASE_STATUS: Record<string, string> = { ativo: "Ativo", suspenso: "Suspenso", arquivado: "Arquivado", encerrado: "Encerrado" };
export const POA_KIND: Record<string, string> = { ad_judicia: "Ad judicia", ad_judicia_et_extra: "Ad judicia et extra", administrativa: "Administrativa", outro: "Outro" };
