/**
 * Export an HTML element structure to a Word-compatible .doc file
 */
export const exportToDOCX = (elementId: string, filename = 'document.doc'): void => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element #${elementId} not found.`);
  }

  try {
    const htmlContent = element.innerHTML;
    
    // Construct standard Word compatible HTML wrapping
    const documentTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>Exported Document</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #333333;
          }
          h1, h2, h3, h4 {
            color: #1e3a8a;
          }
          h1 { font-size: 20pt; margin-bottom: 5px; text-transform: uppercase; }
          h2 { font-size: 14pt; margin-top: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; }
          h3 { font-size: 11pt; margin-top: 10px; }
          p { margin: 0 0 10px 0; }
          ul { margin: 0 0 10px 20px; }
          li { margin-bottom: 4px; }
          .flex { display: table; width: 100%; }
          .justify-between { display: table-cell; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + documentTemplate], {
      type: 'application/msword;charset=utf-8'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.doc') || filename.endsWith('.docx') ? filename : `${filename}.doc`;
    
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting DOCX:', error);
    throw error;
  }
};
