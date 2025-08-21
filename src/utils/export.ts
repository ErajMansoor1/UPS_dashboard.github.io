import { ExportData } from '../types';
import { format } from 'date-fns';

// --- Helper to download the generated file ---
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// --- CSV Export (remains the same) ---
const generateCSVContent = (data: ExportData): string => {
  const separator = ',';
  let csvContent = '';

  const escapeCell = (cell: any): string => {
    const str = String(cell ?? '');
    if (str.includes(separator) || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const toRow = (arr: any[]): string => arr.map(escapeCell).join(separator) + '\n';

  csvContent += toRow(['UPS Dashboard Report']);
  csvContent += toRow([`Generated on: ${format(new Date(data.timestamp), 'yyyy-MM-dd HH:mm:ss')}`]);
  csvContent += '\n';

  const headers = [
    'Line ID', 'Line Name', 'Company Unit', 'Location', 'Status', 'Load (W)', 'Max Capacity (W)', 'Load %', 'Difference (W)', 'UPS Status'
  ];
  csvContent += toRow(headers);

  data.lines.forEach(line => {
    const row = [
      line.lineId,
      line.lineName,
      line.companyUnitName,
      line.location,
      line.status,
      line.totalLoadWattPerLine,
      line.upsMaxLoadWatt,
      line.loadPercentage.toFixed(2),
      line.totalLoadDifference,
      line.maintenanceStatus
    ];
    csvContent += toRow(row);
  });

  return csvContent;
};

export const exportToCSV = (data: ExportData, filename: string): void => {
  const csvContent = generateCSVContent(data);
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};


// --- New, Styled Excel Export ---
const generateExcelHTML = (data: ExportData): string => {
  const { lines, metrics, timestamp } = data;

  const styles = `
    <style>
      body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; }
      .title { font-size: 24px; font-weight: bold; color: #ffffff; background-color: #4F81BD; text-align: center; padding: 10px; }
      .subtitle { font-size: 12px; color: #555555; text-align: left; }
      .summary-table { border-collapse: collapse; margin-bottom: 25px; width: 400px; border: 1px solid #000; }
      .summary-table td { border: 1px solid #000; padding: 5px; }
      .details-header { font-size: 16px !important; font-weight: bold; color: #ffffff; background-color: #4F81BD; text-align: center; padding: 8px; }
      .data-table { border-collapse: collapse; width: 100%; border: 1px solid #000; }
      .data-table th, .data-table td { border: 1px solid #000; padding: 8px; text-align: center; vertical-align: middle; }
      .data-table th { background-color: #4F81BD; color: #ffffff; font-weight: bold; font-size: 10px !important; }
      .status-active { background-color: #00B050 !important; color: #000000; font-weight: bold; }
      .status-inactive { background-color: #FF0000 !important; color: #ffffff; font-weight: bold; }
      .load-normal { background-color: #92D050 !important; }
      .load-medium { background-color: #FFFF00 !important; }
      .load-critical { background-color: #FF0000 !important; color: #ffffff; }
      td { mso-number-format:"\@"; } /* Ensures text format for all cells */
    </style>
  `;

  const summarySection = `
    <table class="summary-table">
      <tr><td colspan="2" class="title">UPS Dashboard Report</td></tr>
      <tr><td colspan="2" class="subtitle">Generated on: ${format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss')}</td></tr>
      <tr><td>Total Lines</td><td>${lines.length}</td></tr>
      <tr><td>Active Lines</td><td>${metrics.activeCount}</td></tr>
      <tr><td>High Load Lines (>80%)</td><td>${metrics.highLoadCount}</td></tr>
      <tr><td>Maintenance Required</td><td>${metrics.maintenanceCount}</td></tr>
      <tr><td>Faulty UPS</td><td>${metrics.faultyCount}</td></tr>
    </table>
  `;

  const lineDetailsHeaders = `
    <tr>
      <th>Line ID</th>
      <th>UPS Serial No</th>
      <th>UPS KVA</th>
      <th>Line Name</th>
      <th>Company Unit</th>
      <th>Location</th>
      <th>Station Name</th>
      <th>Equipments Qty</th>
      <th>PER Watt</th>
      <th>Line Load (W)</th>
      <th>UPS Max Capacity (W)</th>
      <th>UPS Load Difference (W)</th>
      <th>Line Load %</th>
      <th>UPS Status</th>
      <th>Status</th>
    </tr>
  `;

  const lineDetailsRows = lines.map(line => {
    const rowCount = Math.max(line.stations.length, 1);
    let rowsHtml = '';

    const statusClass = line.status === 'Active' ? 'status-active' : 'status-inactive';
    let loadPercentageClass = '';
    if (line.loadPercentage >= 95) loadPercentageClass = 'load-critical';
    else if (line.loadPercentage >= 80) loadPercentageClass = 'load-medium';
    else loadPercentageClass = 'load-normal';

    const upsSerials = line.upsUnits.map(u => u.serialNumber).join('<br>');
    const totalKva = line.upsUnits.reduce((sum, u) => sum + u.kva, 0).toFixed(1);

    for (let i = 0; i < rowCount; i++) {
      const station = line.stations[i];
      rowsHtml += '<tr>';

      if (i === 0) {
        rowsHtml += `<td rowspan="${rowCount}">${line.lineId}</td>`;
        rowsHtml += `<td rowspan="${rowCount}">${upsSerials}</td>`;
        rowsHtml += `<td rowspan="${rowCount}">${totalKva}</td>`;
        rowsHtml += `<td rowspan="${rowCount}">${line.lineName}</td>`;
        rowsHtml += `<td rowspan="${rowCount}">${line.companyUnitName}</td>`;
        rowsHtml += `<td rowspan="${rowCount}">${line.location}</td>`;
      }

      if (station) {
        rowsHtml += `<td>${station.name || 'Unnamed'}</td>`;
        rowsHtml += `<td>${station.assetQuantity}</td>`;
        rowsHtml += `<td>${station.assetWatts}</td>`;
      } else {
        rowsHtml += '<td></td><td></td><td></td>';
      }

      if (i === 0) {
        rowsHtml += `<td rowspan="${rowCount}">${line.totalLoadWattPerLine.toFixed(0)}</td>`;
        rowsHtml += `<td rowspan="${rowCount}">${line.upsMaxLoadWatt.toFixed(0)}</td>`;
        rowsHtml += `<td rowspan="${rowCount}">${line.totalLoadDifference.toFixed(0)}</td>`;
        rowsHtml += `<td rowspan="${rowCount}" class="${loadPercentageClass}">${line.loadPercentage.toFixed(1)}%</td>`;
        rowsHtml += `<td rowspan="${rowCount}">${line.maintenanceStatus}</td>`;
        rowsHtml += `<td rowspan="${rowCount}" class="${statusClass}">${line.status}</td>`;
      }
      
      rowsHtml += '</tr>';
    }
    return rowsHtml;
  }).join('');

  const lineDetailsSection = `
    <table class="data-table" x:str>
      <thead>
        <tr><th colspan="15" class="details-header">Line Details</th></tr>
        ${lineDetailsHeaders}
      </thead>
      <tbody>${lineDetailsRows}</tbody>
    </table>
  `;

  const excelXml = `
    <!--[if gte mso 9]>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
      </o:OfficeDocumentSettings>
      <x:ExcelWorkbook>
        <x:ExcelWorksheets>
          <x:ExcelWorksheet>
            <x:Name>UPS Report</x:Name>
            <x:WorksheetOptions>
              <x:DisplayGridlines/>
              <x:AutoFilter x:Range="R9C1:R9C15" xmlns="urn:schemas-microsoft-com:office:excel"/>
            </x:WorksheetOptions>
          </x:ExcelWorksheet>
        </x:ExcelWorksheets>
      </x:ExcelWorkbook>
    </xml>
    <![endif]-->
  `;

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        ${styles}
        ${excelXml}
      </head>
      <body>
        ${summarySection}
        ${lineDetailsSection}
      </body>
    </html>
  `;
};

export const exportToExcel = (data: ExportData, filename: string): void => {
  const htmlContent = generateExcelHTML(data);
  downloadFile(htmlContent, filename, 'application/vnd.ms-excel');
};
