// Brazilian masks and validators (CPF, CNPJ, phone, CEP, CNJ process number)
export const onlyDigits = (v: string | null | undefined) => (v ?? "").replace(/\D/g, "");

export function isValidCPF(v: string): boolean {
  const d = onlyDigits(v);
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  const calc = (len: number) => {
    let s = 0;
    for (let i = 0; i < len; i++) s += Number(d[i]) * (len + 1 - i);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
}

export function isValidCNPJ(v: string): boolean {
  const d = onlyDigits(v);
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const calc = (len: number) => {
    const w = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const s = w.reduce((acc, wi, i) => acc + wi * Number(d[i]), 0);
    const r = s % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(12) === Number(d[12]) && calc(13) === Number(d[13]);
}

export function maskCPF(v: string) {
  return onlyDigits(v).slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
export function maskCNPJ(v: string) {
  return onlyDigits(v).slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
}
export const maskDoc = (v: string, kind: "pf" | "pj") => (kind === "pf" ? maskCPF(v) : maskCNPJ(v));

export function maskPhone(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 10) return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}
export const maskCEP = (v: string) => onlyDigits(v).slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");

/** CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO — check digits via ISO 7064 mod 97-10 */
export function maskCNJ(v: string) {
  return onlyDigits(v).slice(0, 20)
    .replace(/^(\d{7})(\d)/, "$1-$2").replace(/-(\d{2})(\d)/, "-$1.$2")
    .replace(/\.(\d{4})(\d)/, ".$1.$2").replace(/\.(\d{4})\.(\d)(\d)/, ".$1.$2.$3")
    .replace(/\.(\d)\.(\d{2})(\d)/, ".$1.$2.$3");
}
export function isValidCNJ(v: string): boolean {
  const d = onlyDigits(v);
  if (d.length !== 20) return false;
  const n = d.slice(0, 7), dv = d.slice(7, 9), rest = d.slice(9);
  const num = BigInt(n + rest + "00");
  const calc = 98n - (num % 97n);
  return calc === BigInt(dv);
}

export const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
