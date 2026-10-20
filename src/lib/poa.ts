// Deterministic power-of-attorney template. Never invents data: missing fields become "[PREENCHER: ...]".
export type Grantor = {
  kind: "pf" | "pj"; name: string; nationality?: string; marital_status?: string; profession?: string;
  document?: string; rg?: string; address?: string; email?: string; phone?: string; representative?: string;
};
export type Attorney = { name: string; nationality?: string; marital_status?: string; oab: string; oab_uf: string; firm?: string; address?: string; email?: string };
export type PoaData = {
  grantor: Grantor; attorneys: Attorney[];
  kind: "ad_judicia" | "ad_judicia_et_extra" | "administrativa" | "outro";
  kind_other?: string; purpose: string;
  powers: string[]; special_powers_enabled: boolean; special_powers: string[];
  place: string; date: string; validity?: string;
};

export const GENERAL_POWERS: { id: string; label: string; text: string }[] = [
  { id: "foro_geral", label: "Cláusula ad judicia (foro em geral)", text: "os poderes da cláusula ad judicia para o foro em geral, podendo propor ações e defendê-lo(a) nas contrárias, em qualquer juízo, instância ou tribunal" },
  { id: "recursos", label: "Interpor recursos", text: "interpor e acompanhar recursos de qualquer natureza" },
  { id: "substabelecer", label: "Substabelecer", text: "substabelecer, com ou sem reserva de poderes" },
  { id: "acordos_audiencia", label: "Representar em audiências", text: "representar o(a) outorgante em audiências de conciliação, mediação e instrução" },
  { id: "reparticoes", label: "Repartições públicas", text: "representar o(a) outorgante perante repartições públicas federais, estaduais e municipais, autarquias e entidades privadas" },
  { id: "documentos", label: "Requerer e retirar documentos", text: "requerer, protocolar e retirar documentos e certidões" },
];
export const SPECIAL_POWERS: { id: string; label: string; text: string }[] = [
  { id: "receber_citacao", label: "Receber citação", text: "receber citação" },
  { id: "confessar", label: "Confessar", text: "confessar" },
  { id: "reconhecer_procedencia", label: "Reconhecer a procedência do pedido", text: "reconhecer a procedência do pedido" },
  { id: "transigir", label: "Transigir", text: "transigir" },
  { id: "desistir", label: "Desistir", text: "desistir" },
  { id: "renunciar", label: "Renunciar ao direito", text: "renunciar ao direito sobre o qual se funda a ação" },
  { id: "receber_quitar", label: "Receber e dar quitação", text: "receber e dar quitação" },
  { id: "firmar_compromisso", label: "Firmar compromisso", text: "firmar compromisso" },
  { id: "hipossuficiencia", label: "Declarar hipossuficiência", text: "assinar declaração de hipossuficiência econômica" },
];

const KIND_TITLE: Record<PoaData["kind"], string> = {
  ad_judicia: "PROCURAÇÃO AD JUDICIA", ad_judicia_et_extra: "PROCURAÇÃO AD JUDICIA ET EXTRA",
  administrativa: "PROCURAÇÃO ADMINISTRATIVA", outro: "PROCURAÇÃO",
};
const f = (v: string | undefined | null, label: string) => (v && v.trim() ? v.trim() : `[PREENCHER: ${label}]`);
const fOpt = (v: string | undefined | null, prefix: string) => (v && v.trim() ? `${prefix}${v.trim()}` : "");

function joinList(items: string[]) {
  if (items.length <= 1) return items.join("");
  return items.slice(0, -1).join("; ") + " e " + items[items.length - 1];
}

export function formatDateLong(iso: string) {
  if (!iso) return "[PREENCHER: data]";
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  return `${d} de ${months[m - 1]} de ${y}`;
}

export function buildPoaText(data: PoaData): string {
  const g = data.grantor;
  const grantorText = g.kind === "pj"
    ? `${f(g.name, "razão social").toUpperCase()}, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº ${f(g.document, "CNPJ")}, com sede em ${f(g.address, "endereço")}${fOpt(g.representative, ", neste ato representada por ")}${fOpt(g.email, ", e-mail ")}${fOpt(g.phone, ", telefone ")}`
    : `${f(g.name, "nome").toUpperCase()}, ${f(g.nationality, "nacionalidade")}, ${f(g.marital_status, "estado civil")}, ${f(g.profession, "profissão")}, portador(a) do RG nº ${f(g.rg, "RG")} e inscrito(a) no CPF sob o nº ${f(g.document, "CPF")}, residente e domiciliado(a) em ${f(g.address, "endereço")}${fOpt(g.email, ", e-mail ")}${fOpt(g.phone, ", telefone ")}`;

  const attorneys = data.attorneys.length ? data.attorneys : [{ name: "", oab: "", oab_uf: "" } as Attorney];
  const attText = attorneys.map((a) =>
    `${f(a.name, "nome do advogado").toUpperCase()}${fOpt(a.nationality, ", ")}${fOpt(a.marital_status, ", ")}, advogado(a) inscrito(a) na OAB/${f(a.oab_uf, "UF")} sob o nº ${f(a.oab, "número OAB")}${fOpt(a.firm, ", integrante de ")}${fOpt(a.address, ", com endereço profissional em ")}${fOpt(a.email, ", e-mail ")}`
  ).join("; e ");

  const general = GENERAL_POWERS.filter((p) => data.powers.includes(p.id)).map((p) => p.text);
  const special = data.special_powers_enabled
    ? SPECIAL_POWERS.filter((p) => data.special_powers.includes(p.id)).map((p) => p.text)
    : [];

  const plural = attorneys.length > 1;
  const parts: string[] = [];
  parts.push(data.kind === "outro" && data.kind_other ? data.kind_other.toUpperCase() : KIND_TITLE[data.kind]);
  parts.push("");
  parts.push(`OUTORGANTE: ${grantorText}.`);
  parts.push("");
  parts.push(`OUTORGADO${plural ? "S" : ""}: ${attText}.`);
  parts.push("");
  let poderes = `PODERES: Pelo presente instrumento particular de mandato, o(a) outorgante nomeia e constitui ${plural ? "seus bastantes procuradores os outorgados acima qualificados, que poderão agir em conjunto ou separadamente" : "seu(sua) bastante procurador(a) o(a) outorgado(a) acima qualificado(a)"}, a quem confere`;
  poderes += general.length ? ` ${joinList(general)}` : " [PREENCHER: poderes conferidos]";
  if (special.length) poderes += `, bem como os poderes especiais para ${joinList(special)}`;
  poderes += ".";
  parts.push(poderes);
  parts.push("");
  parts.push(`FINALIDADE: ${f(data.purpose, "finalidade específica do mandato")}.`);
  if (data.validity && data.validity.trim()) { parts.push(""); parts.push(`VALIDADE: ${data.validity.trim()}.`); }
  parts.push("");
  parts.push(`${f(data.place, "local")}, ${formatDateLong(data.date)}.`);
  parts.push("");
  parts.push("");
  parts.push("_______________________________________________");
  parts.push(f(g.name, "nome do outorgante").toUpperCase());
  parts.push(g.kind === "pj" ? `CNPJ: ${f(g.document, "CNPJ")}` : `CPF: ${f(g.document, "CPF")}`);
  return parts.join("\n");
}

export const hasPlaceholders = (text: string) => /\[PREENCHER:/.test(text);
