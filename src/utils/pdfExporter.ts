import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Helper to get an offscreen 2D canvas context for parsing modern CSS colors (oklch, color-mix, lab, lch)
 * into standard browser-supported RGB / hex strings.
 */
const getOffscreenCanvasContext = (): CanvasRenderingContext2D | null => {
  if (typeof document === 'undefined') return null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.getContext('2d');
  } catch {
    return null;
  }
};

/**
 * Converts a modern CSS color value into standard hex/rgb format using canvas rendering.
 */
const sanitizeColorString = (ctx: CanvasRenderingContext2D | null, colorVal: string): string => {
  if (!colorVal || colorVal === 'transparent' || colorVal === 'inherit' || colorVal === 'initial') {
    return colorVal;
  }
  if (!colorVal.includes('oklch') && !colorVal.includes('color-mix') && !colorVal.includes('lab') && !colorVal.includes('lch')) {
    return colorVal;
  }
  if (!ctx) return colorVal;

  try {
    ctx.fillStyle = '#000000';
    ctx.fillStyle = colorVal;
    const computed = ctx.fillStyle;
    if (computed && !computed.includes('oklch') && !computed.includes('color-mix')) {
      return computed;
    }
  } catch {
    // Ignore errors and fallback
  }

  return '#1e293b';
};

/**
 * Replaces any oklch(...) or color-mix(...) expressions within CSS text.
 */
const sanitizeCssText = (ctx: CanvasRenderingContext2D | null, cssText: string): string => {
  if (!cssText || (!cssText.includes('oklch') && !cssText.includes('color-mix') && !cssText.includes('lab') && !cssText.includes('lch'))) {
    return cssText;
  }
  return cssText.replace(/(?:oklch|color-mix|lab|lch)\([^)]*(?:\([^)]*\)[^)]*)*\)/gi, (match) => {
    return sanitizeColorString(ctx, match);
  });
};

/**
 * Pre-convert remote images to Data URLs to prevent CORS / tainted canvas errors.
 */
const convertImageToDataUrl = async (imgUrl: string): Promise<string> => {
  if (!imgUrl || imgUrl.startsWith('data:')) {
    return imgUrl;
  }
  try {
    const response = await fetch(imgUrl, { mode: 'cors' });
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(typeof reader.result === 'string' ? reader.result : imgUrl);
      };
      reader.onerror = () => {
        resolve(imgUrl);
      };
      reader.readAsDataURL(blob);
    });
  } catch {
    return imgUrl;
  }
};

/**
 * Wait for all images inside the element to finish loading or fail gracefully.
 */
const waitForImages = async (element: HTMLElement): Promise<void> => {
  const images = Array.from(element.querySelectorAll('img'));
  if (images.length === 0) return;

  await Promise.all(
    images.map(img => {
      if (img.complete && img.naturalWidth !== 0) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        const timeout = setTimeout(() => resolve(), 3000);
        const onFinish = () => {
          clearTimeout(timeout);
          img.removeEventListener('load', onFinish);
          img.removeEventListener('error', onFinish);
          resolve();
        };
        img.addEventListener('load', onFinish);
        img.addEventListener('error', onFinish);
      });
    })
  );
};

/**
 * Capture an A4 HTML element and export it as a high-resolution, true A4 portrait PDF.
 * Preserves aspect ratio, supports multi-page pagination if content exceeds 1 page,
 * sanitizes modern CSS colors, handles images safely, and downloads using a reliable Blob URL.
 */
export const exportToPDF = async (elementId: string, filename = 'resume.pdf'): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Print target element #${elementId} not found.`);
  }

  try {
    // 1. Wait for all images inside the element to finish loading
    await waitForImages(element);

    // 2. Pre-convert external images to base64 Data URLs where possible
    const imgElements = Array.from(element.querySelectorAll('img'));
    const dataUrlMap = new Map<string, string>();
    for (const img of imgElements) {
      if (img.src && !img.src.startsWith('data:') && !dataUrlMap.has(img.src)) {
        const dataUrl = await convertImageToDataUrl(img.src);
        dataUrlMap.set(img.src, dataUrl);
      }
    }

    // 3. Render HTML to canvas with html2canvas and safe CSS / image handling
    const canvas = await html2canvas(element, {
      scale: 2, // 2x scale for crisp print quality
      useCORS: true, // load photo urls
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc, clonedElement) => {
        const ctx = getOffscreenCanvasContext();

        // 3a. Sanitize any modern CSS colors inside cloned <style> elements
        clonedDoc.querySelectorAll('style').forEach((styleEl) => {
          if (styleEl.textContent && (styleEl.textContent.includes('oklch') || styleEl.textContent.includes('color-mix') || styleEl.textContent.includes('lab') || styleEl.textContent.includes('lch'))) {
            styleEl.textContent = sanitizeCssText(ctx, styleEl.textContent);
          }
        });

        // 3b. Reset print container styles to prevent raster shadows on PDF output
        clonedElement.style.boxShadow = 'none';
        clonedElement.style.backgroundColor = '#ffffff';

        // 3c. Walk all elements in the cloned tree and convert computed colors to inline RGB
        const allElements = Array.from(clonedElement.querySelectorAll<HTMLElement>('*'));
        const elementsToProcess = [clonedElement, ...allElements];

        elementsToProcess.forEach((el) => {
          try {
            const win = clonedDoc.defaultView || window;
            const computed = win.getComputedStyle(el);

            if (computed.color && (computed.color.includes('oklch') || computed.color.includes('color-mix'))) {
              el.style.color = sanitizeColorString(ctx, computed.color);
            }
            if (computed.backgroundColor && (computed.backgroundColor.includes('oklch') || computed.backgroundColor.includes('color-mix'))) {
              el.style.backgroundColor = sanitizeColorString(ctx, computed.backgroundColor);
            }
            if (computed.borderColor && (computed.borderColor.includes('oklch') || computed.borderColor.includes('color-mix'))) {
              el.style.borderColor = sanitizeColorString(ctx, computed.borderColor);
            }
            if (computed.borderTopColor && (computed.borderTopColor.includes('oklch') || computed.borderTopColor.includes('color-mix'))) {
              el.style.borderTopColor = sanitizeColorString(ctx, computed.borderTopColor);
            }
            if (computed.borderRightColor && (computed.borderRightColor.includes('oklch') || computed.borderRightColor.includes('color-mix'))) {
              el.style.borderRightColor = sanitizeColorString(ctx, computed.borderRightColor);
            }
            if (computed.borderBottomColor && (computed.borderBottomColor.includes('oklch') || computed.borderBottomColor.includes('color-mix'))) {
              el.style.borderBottomColor = sanitizeColorString(ctx, computed.borderBottomColor);
            }
            if (computed.borderLeftColor && (computed.borderLeftColor.includes('oklch') || computed.borderLeftColor.includes('color-mix'))) {
              el.style.borderLeftColor = sanitizeColorString(ctx, computed.borderLeftColor);
            }
            if (computed.outlineColor && (computed.outlineColor.includes('oklch') || computed.outlineColor.includes('color-mix'))) {
              el.style.outlineColor = sanitizeColorString(ctx, computed.outlineColor);
            }
            if (computed.boxShadow && (computed.boxShadow.includes('oklch') || computed.boxShadow.includes('color-mix'))) {
              el.style.boxShadow = sanitizeCssText(ctx, computed.boxShadow);
            }
          } catch {
            // Ignore errors for individual elements
          }
        });

        // 3d. Replace external image URLs with converted Data URLs and handle broken images
        clonedElement.querySelectorAll('img').forEach((clonedImg) => {
          if (dataUrlMap.has(clonedImg.src)) {
            clonedImg.src = dataUrlMap.get(clonedImg.src)!;
          }
          // If the image is broken or empty, hide it gracefully so it does not crash html2canvas
          if (!clonedImg.src || (clonedImg.naturalWidth === 0 && !clonedImg.complete)) {
            clonedImg.style.visibility = 'hidden';
          }
        });
      }
    });

    // 4. Create jsPDF document with strict A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = 210;
    const pdfHeight = 297;
    const a4Ratio = pdfHeight / pdfWidth; // 297 / 210 ≈ 1.4142857
    const a4PageHeightPx = Math.floor(canvas.width * a4Ratio);

    // 5. Handle Single Page vs Multi-Page without stretching
    if (canvas.height <= a4PageHeightPx * 1.02) {
      // Single Page: content fits within 1 A4 page
      const renderedHeight = (canvas.height * pdfWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, renderedHeight);
    } else {
      // Multi-Page: automatically paginate without cutting off or stretching
      let currentY = 0;
      let pageIndex = 0;

      while (currentY < canvas.height) {
        const sliceHeight = Math.min(a4PageHeightPx, canvas.height - currentY);

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = a4PageHeightPx;
        const pageCtx = pageCanvas.getContext('2d');

        if (pageCtx) {
          pageCtx.fillStyle = '#ffffff';
          pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          pageCtx.drawImage(
            canvas,
            0, currentY, canvas.width, sliceHeight,
            0, 0, canvas.width, sliceHeight
          );
        }

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);

        if (pageIndex > 0) {
          pdf.addPage('a4', 'portrait');
        }

        pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        currentY += sliceHeight;
        pageIndex++;
      }
    }

    // 6. Reliable Browser Download using Blob URL
    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = safeFilename;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();

    setTimeout(() => {
      if (document.body.contains(downloadLink)) {
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(blobUrl);
    }, 200);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
