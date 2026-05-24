import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ExportPDF = ({ tasks, users, stats, user }) => {
  const handleExport = () => {
    const doc = new jsPDF();
    const today = new Date();
    const dateStr = today.toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const primaryColor = [99, 102, 241];
    const successColor = [74, 222, 128];
    const warningColor = [245, 158, 11];
    const dangerColor  = [248, 113, 113];
    const blueColor    = [96, 165, 250];
    const textDark     = [15, 23, 42];
    const textMuted    = [100, 116, 139];
    const borderColor  = [226, 232, 240];

    const pageW = doc.internal.pageSize.getWidth();

    // ── HEADER BANNER ──────────────────────────────────────
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageW, 38, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('TaskTeam', 14, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Laporan Ringkasan Tim', 14, 23);

    doc.setFontSize(8);
    doc.setTextColor(200, 210, 255);
    doc.text(`Dibuat oleh: ${user?.name || user?.username || 'Manager'}`, 14, 31);
    doc.text(`Tanggal: ${dateStr}`, pageW - 14, 31, { align: 'right' });

    let y = 48;

    // ── RINGKASAN STATISTIK ────────────────────────────────
    doc.setTextColor(...textDark);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Ringkasan Statistik', 14, y);
    y += 6;

    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.line(14, y, pageW - 14, y);
    y += 6;

    const statBoxes = [
      { label: 'Total Tugas',  value: stats.total,      color: primaryColor },
      { label: 'Selesai',      value: stats.selesai,    color: successColor },
      { label: 'Dikerjakan',   value: stats.dikerjakan, color: blueColor    },
      { label: 'To Do',        value: stats.todo,       color: warningColor },
      { label: 'Terlewat',     value: stats.terlewat,   color: dangerColor  },
    ];

    const boxW = (pageW - 28 - 16) / 5;
    statBoxes.forEach((s, i) => {
      const x = 14 + i * (boxW + 4);

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.4);
      doc.roundedRect(x, y, boxW, 22, 2, 2, 'FD');

      doc.setFillColor(...s.color);
      doc.roundedRect(x, y, boxW, 4, 2, 2, 'F');
      doc.rect(x, y + 2, boxW, 2, 'F');

      doc.setTextColor(...s.color);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(String(s.value), x + boxW / 2, y + 14, { align: 'center' });

      doc.setTextColor(...textMuted);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(s.label, x + boxW / 2, y + 20, { align: 'center' });
    });

    y += 30;

    // ── PROGRESS BAR ───────────────────────────────────────
    if (stats.total > 0) {
      const pct = Math.round((stats.selesai / stats.total) * 100);
      const barW = pageW - 28;

      doc.setTextColor(...textDark);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`Progress Keseluruhan: ${pct}%`, 14, y);
      y += 4;

      doc.setFillColor(...borderColor);
      doc.roundedRect(14, y, barW, 5, 2, 2, 'F');
      doc.setFillColor(...successColor);
      doc.roundedRect(14, y, barW * (pct / 100), 5, 2, 2, 'F');
      y += 12;
    }

    // ── DEADLINE TERDEKAT ──────────────────────────────────
    const todayDate = new Date();
    const deadlines = tasks
      .filter(t => t.status !== 'Selesai' && t.deadline)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);

    if (deadlines.length > 0) {
      doc.setTextColor(...textDark);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Deadline Terdekat', 14, y);
      y += 6;

      doc.setDrawColor(...borderColor);
      doc.line(14, y, pageW - 14, y);
      y += 4;

      autoTable(doc, {
        startY: y,
        head: [['Tugas', 'Assignee', 'Deadline', 'Status']],
        body: deadlines.map(t => {
          const diff = Math.ceil((new Date(t.deadline) - todayDate) / (1000 * 60 * 60 * 24));
          const statusLabel = diff < 0 ? 'Terlewat' : `${diff} hari lagi`;
          return [
            t.title,
            t.assignedTo || t.assignee || t.member || '-',
            new Date(t.deadline).toLocaleDateString('id-ID'),
            statusLabel,
          ];
        }),
        styles: {
          fontSize: 8,
          cellPadding: 4,
          textColor: textDark,
        },
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 40 },
          2: { cellWidth: 30 },
          3: { cellWidth: 35 },
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 },
        didParseCell: (data) => {
          if (data.column.index === 3 && data.section === 'body') {
            const val = data.cell.text[0];
            if (val === 'Terlewat') {
              data.cell.styles.textColor = dangerColor;
              data.cell.styles.fontStyle = 'bold';
            } else if (parseInt(val) <= 3) {
              data.cell.styles.textColor = warningColor;
            } else {
              data.cell.styles.textColor = [22, 163, 74];
            }
          }
        },
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // ── TABEL SEMUA TUGAS ──────────────────────────────────
    doc.setTextColor(...textDark);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Daftar Semua Tugas', 14, y);
    y += 6;

    doc.setDrawColor(...borderColor);
    doc.line(14, y, pageW - 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['#', 'Judul Tugas', 'Assignee', 'Deadline', 'Status']],
      body: tasks.map((t, i) => [
        i + 1,
        t.title,
        t.assignedTo || t.assignee || t.member || '-',
        t.deadline ? new Date(t.deadline).toLocaleDateString('id-ID') : '-',
        t.status,
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 3.5,
        textColor: textDark,
        overflow: 'ellipsize',
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 8,  halign: 'center' },
        1: { cellWidth: 75 },
        2: { cellWidth: 35 },
        3: { cellWidth: 28 },
        4: { cellWidth: 28 },
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
      didParseCell: (data) => {
        if (data.column.index === 4 && data.section === 'body') {
          const val = data.cell.text[0];
          if (val === 'Selesai')         data.cell.styles.textColor = [22, 163, 74];
          else if (val === 'Dikerjakan') data.cell.styles.textColor = [29, 78, 216];
          else if (val === 'To Do')      data.cell.styles.textColor = [180, 83, 9];
          else                           data.cell.styles.textColor = dangerColor;
        }
      },
    });

    // ── FOOTER ─────────────────────────────────────────────
    const pageCount = doc.internal.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      const pageH = doc.internal.pageSize.getHeight();

      doc.setFillColor(248, 250, 252);
      doc.rect(0, pageH - 12, pageW, 12, 'F');

      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.3);
      doc.line(0, pageH - 12, pageW, pageH - 12);

      doc.setTextColor(...textMuted);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('TaskTeam — Laporan dibuat otomatis', 14, pageH - 4);
      doc.text(`Halaman ${p} dari ${pageCount}`, pageW - 14, pageH - 4, { align: 'right' });
    }

    // ── SAVE ───────────────────────────────────────────────
    const filename = `laporan-taskteam-${today.toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  };

  return (
    <button onClick={handleExport} className="mgr-export-btn">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Export PDF
    </button>
  );
};

export default ExportPDF;