// Client-side PDF/DOCX export for reviewed document text.
export async function exportPdf(text: string, filename: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 25, width = 210 - margin * 2, pageH = 297, lineH = 6.2;
  let y = margin;
  const lines = text.split("\n");
  lines.forEach((raw, idx) => {
    const isTitle = idx === 0;
    doc.setFont("times", isTitle ? "bold" : "normal");
    doc.setFontSize(isTitle ? 14 : 12);
    const wrapped: string[] = raw.trim() === "" ? [""] : doc.splitTextToSize(raw, width);
    wrapped.forEach((ln) => {
      if (y + lineH > pageH - margin) { doc.addPage(); y = margin; }
      if (isTitle) doc.text(ln, 105, y, { align: "center" });
      else doc.text(ln, margin, y, { align: "left", maxWidth: width });
      y += lineH;
    });
  });
  doc.save(filename.endsWith(".pdf") ? filename : filename + ".pdf");
}

export async function exportDocx(text: string, filename: string) {
  const { Document, Packer, Paragraph, TextRun, AlignmentType } = await import("docx");
  const { saveAs } = await import("file-saver");
  const lines = text.split("\n");
  const doc = new Document({
    styles: { default: { document: { run: { font: "Times New Roman", size: 24 } } } },
    sections: [{
      properties: { page: { margin: { top: 1418, bottom: 1418, left: 1418, right: 1418 } } },
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
