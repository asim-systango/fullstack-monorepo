import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Captures a DOM element and converts it into a high-quality single-page A4 PDF.
 * @param elementId The HTML element ID to capture.
 * @param filename The name of the file to save (e.g. 'Prescription-12345.pdf').
 */
export async function exportElementToPdf(
  elementId: string,
  filename: string,
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found for PDF export.`);
  }

  const canvas = await html2canvas(element, {
    scale: 2, // High resolution capture
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // Calculate ratio to fit nicely on standard A4 page with margins
  const margin = 10; // 10mm margin
  const maxW = pdfWidth - margin * 2;
  const maxH = pdfHeight - margin * 2;
  const ratio = Math.min(maxW / imgWidth, maxH / imgHeight);

  const finalW = imgWidth * ratio;
  const finalH = imgHeight * ratio;
  const imgX = (pdfWidth - finalW) / 2;
  const imgY = margin;

  pdf.addImage(imgData, 'PNG', imgX, imgY, finalW, finalH);
  pdf.save(filename);
}

/**
 * Opens a print dialog for the specified DOM element.
 * @param elementId The HTML element ID to print.
 */
export function printElement(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) return;

  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    window.print();
    return;
  }

  const doc = printWindow.document;
  doc.title = 'Medical Prescription Print';

  Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).forEach(
    (node) => {
      doc.head.appendChild(node.cloneNode(true));
    },
  );

  const printStyle = doc.createElement('style');
  printStyle.textContent = `
    body {
      background-color: white !important;
      color: black !important;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
    }
    @page {
      size: A4;
      margin: 15mm;
    }
  `;
  doc.head.appendChild(printStyle);

  const cloned = element.cloneNode(true);
  doc.body.appendChild(cloned);

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}
