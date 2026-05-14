import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DailySummary, WeeklySummary } from '@web/modules/attendance';
import { formatHours, formatTime } from '@web/lib/utils';

function fmtMinutes(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h === 0) return `${min}m`;
  return min === 0 ? `${h}h` : `${h}h ${min}m`;
}

function drawHeader(doc: jsPDF, title: string, subtitle: string): void {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;

  doc.setFillColor(17, 17, 17);
  doc.roundedRect(margin, 10, pageW - margin * 2, 24, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('WardSuite HCM', margin + 7, 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(title, pageW - margin - 7, 21, { align: 'right' });
  doc.setFontSize(7.5);
  doc.text(subtitle, pageW - margin - 7, 29, { align: 'right' });

  const generated = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(7.5);
  doc.text(`Generated: ${generated}`, margin, 43);
}

function drawKpiRow(doc: jsPDF, kpis: { label: string; value: string }[], y: number): void {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const kpiW = (pageW - margin * 2) / kpis.length;

  kpis.forEach((kpi, i) => {
    const x = margin + i * kpiW;

    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(241, 241, 241);
    doc.roundedRect(x + 1, y, kpiW - 2, 17, 2, 2, 'FD');

    doc.setTextColor(187, 187, 187);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(kpi.label.toUpperCase(), x + kpiW / 2, y + 6.5, { align: 'center' });

    doc.setTextColor(17, 17, 17);
    doc.setFontSize(11);
    doc.text(kpi.value, x + kpiW / 2, y + 13.5, { align: 'center' });
  });
}

function drawFooters(doc: jsPDF): void {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const total = (doc.internal as any).getNumberOfPages();

  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(241, 241, 241);
    doc.setLineWidth(0.3);
    doc.line(margin, pageH - 11, pageW - margin, pageH - 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(187, 187, 187);
    doc.text('WardSuite HCM · Confidential', margin, pageH - 5.5);
    doc.text(`Page ${i} of ${total}`, pageW - margin, pageH - 5.5, { align: 'right' });
  }
}

const tableHeadStyles = {
  fillColor: [17, 17, 17] as [number, number, number],
  textColor: [255, 255, 255] as [number, number, number],
  fontStyle: 'bold' as const,
  fontSize: 8,
  cellPadding: 4,
};

const tableBodyStyles = {
  fontSize: 8,
  cellPadding: 3.5,
  textColor: [17, 17, 17] as [number, number, number],
};

const tableStyles = {
  font: 'helvetica',
  lineColor: [241, 241, 241] as [number, number, number],
  lineWidth: 0.15,
};

export function exportDailyReportPDF(data: DailySummary[], dateKey: string): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const margin = 14;

  drawHeader(doc, 'Attendance Report', `Daily · ${dateKey}`);

  const totalWorked = data.reduce((s, r) => s + r.workedMinutes, 0);
  const totalOT = data.reduce((s, r) => s + r.overtimeMinutes, 0);
  const totalND = data.reduce((s, r) => s + r.nightDifferentialMinutes, 0);
  const totalLate = data.reduce((s, r) => s + r.lateMinutes, 0);
  const totalUT = data.reduce((s, r) => s + r.undertimeMinutes, 0);
  const presentCount = data.filter((r) => r.status !== 'absent').length;

  drawKpiRow(
    doc,
    [
      { label: 'Employees', value: String(data.length) },
      { label: 'Present', value: String(presentCount) },
      { label: 'Total Hours', value: formatHours(totalWorked) },
      { label: 'Overtime', value: formatHours(totalOT) },
      { label: 'Night Diff', value: formatHours(totalND) },
      { label: 'Late', value: fmtMinutes(totalLate) },
      { label: 'Undertime', value: fmtMinutes(totalUT) },
    ],
    47,
  );

  autoTable(doc, {
    startY: 70,
    margin: { left: margin, right: margin },
    head: [['Employee', 'In', 'Out', 'Regular', 'OT', 'ND', 'Late', 'UT', 'Status']],
    body: data.map((r) => [
      r.employeeCode,
      formatTime(r.firstIn),
      formatTime(r.lastOut),
      formatHours(r.regularMinutes),
      r.overtimeMinutes > 0 ? formatHours(r.overtimeMinutes) : '—',
      r.nightDifferentialMinutes > 0 ? formatHours(r.nightDifferentialMinutes) : '—',
      r.lateMinutes > 0 ? fmtMinutes(r.lateMinutes) : '—',
      r.undertimeMinutes > 0 ? fmtMinutes(r.undertimeMinutes) : '—',
      r.status.charAt(0).toUpperCase() + r.status.slice(1),
    ]),
    headStyles: tableHeadStyles,
    bodyStyles: tableBodyStyles,
    alternateRowStyles: { fillColor: [250, 250, 250] as [number, number, number] },
    styles: tableStyles,
    columnStyles: { 0: { fontStyle: 'bold' }, 8: { fontStyle: 'bold' } },
  });

  drawFooters(doc);
  doc.save(`wardsuite-daily-${dateKey}.pdf`);
}

export function exportWeeklyReportPDF(data: WeeklySummary[], weekKey: string): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const margin = 14;

  const rangeLabel =
    data[0]
      ? `${data[0].dateRange.start} – ${data[0].dateRange.end}`
      : weekKey;

  drawHeader(doc, 'Attendance Report', `Weekly · ${rangeLabel}`);

  const totalWorked = data.reduce((s, r) => s + r.workedMinutes, 0);
  const totalOT = data.reduce((s, r) => s + r.overtimeMinutes, 0);
  const totalND = data.reduce((s, r) => s + r.nightDifferentialMinutes, 0);
  const totalLate = data.reduce((s, r) => s + r.lateMinutes, 0);

  drawKpiRow(
    doc,
    [
      { label: 'Employees', value: String(data.length) },
      { label: 'Total Hours', value: formatHours(totalWorked) },
      { label: 'Overtime', value: formatHours(totalOT) },
      { label: 'Night Diff', value: formatHours(totalND) },
      { label: 'Late', value: fmtMinutes(totalLate) },
    ],
    47,
  );

  autoTable(doc, {
    startY: 70,
    margin: { left: margin, right: margin },
    head: [['Employee', 'Days Present', 'Regular', 'OT', 'ND', 'Late', 'UT']],
    body: data.map((r) => [
      r.employeeCode,
      String(r.daysPresent),
      formatHours(r.regularMinutes),
      r.overtimeMinutes > 0 ? formatHours(r.overtimeMinutes) : '—',
      r.nightDifferentialMinutes > 0 ? formatHours(r.nightDifferentialMinutes) : '—',
      r.lateMinutes > 0 ? fmtMinutes(r.lateMinutes) : '—',
      r.undertimeMinutes > 0 ? fmtMinutes(r.undertimeMinutes) : '—',
    ]),
    headStyles: tableHeadStyles,
    bodyStyles: tableBodyStyles,
    alternateRowStyles: { fillColor: [250, 250, 250] as [number, number, number] },
    styles: tableStyles,
    columnStyles: { 0: { fontStyle: 'bold' } },
  });

  drawFooters(doc);
  doc.save(`wardsuite-weekly-${weekKey.replace(/\//g, '-')}.pdf`);
}
