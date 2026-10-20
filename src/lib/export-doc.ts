// Browser-side print-to-PDF; does not depend on server-incompatible PDF bundlers.
export async function exportPdf(text: string, _filename: string) {
  if (typeof window === "undefined") throw new Error("Exportação PDF disponível no navegador.");
  const frame = document.createElement("iframe");
  frame.style.position="fixed";frame.style.right="0";frame.style.bottom="0";frame.style.width="0";frame.style.height="0";frame.style.border="0";
  document.body.appendChild(frame);
  const doc=frame.contentDocument;
  if(!doc)throw new Error("Não foi possível preparar a impressão.");
  doc.open();doc.write('<!DOCTYPE html><html lang="pt-BR"><head><title>Documento jurídico</title><style>@page{size:A4;margin:3cm 2cm 2cm 3cm}body{font:12pt \"Times New Roman\",serif;line-height:1.5;text-align:justify;white-space:pre-wrap}</style></head><body></body></html>');doc.close();
  doc.body.textContent=text;
  frame.contentWindow?.focus();frame.contentWindow?.print();
  setTimeout(()=>frame.remove(),60000);
}

export async function exportDocx(text: string, filename: string) {
  const { Document, Packer, Paragraph, TextRun, AlignmentType } = await import("docx");
  const { saveAs } = await import("file-saver");
  const lines = text.split("\n");
  const doc = new Document({
    styles: { default: { document: { run: { font: "Times New Roman", size: 24 } } } },
    sections: [{
      properties: { page: { margin: { top: 1701, bottom: 1134, left: 1701, right: 1134 } } },
      children: lines.map((ln, i) => new Paragraph({
        alignment: i === 0 ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
        spacing: { after: 120, line: 360 },
        children: [new TextRun({ text: ln, bold: i === 0, size: i === 0 ? 28 : 24 })],
      })),
    }],
  });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename.endsWith(".docx") ? filename : filename + ".docx");
}
