import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Capture an A4 HTML element and export it as a high-resolution PDF
 */
export const exportToPDF = async (elementId: string, filename = 'resume.pdf'): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Print target element #${elementId} not found.`);
  }

  try {
    // 1. Temporarily override print styles in memory if needed
    const originalStyle = element.style.cssText;
    element.style.boxShadow = 'none';

    // 2. Render HTML to canvas
    const canvas = await html2canvas(element, {
      scale: 2, // 2x scale for print quality resolution
      useCORS: true, // load photo urls
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Restore original styles
    element.style.cssText = originalStyle;

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // 3. Create PDF matching strict A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = 210;
    const pdfHeight = 297;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
