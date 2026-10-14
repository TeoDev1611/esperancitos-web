import * as pdfjsLib from 'pdfjs-dist';
// Vite resuelve archivos de worker con ?url automáticamente
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

interface TextItemWithTransform {
  str: string;
  transform: number[];
  width?: number;
}

/**
 * Reconstruye las líneas de texto respetando la posición 2D (Y para filas, X para columnas).
 * Esto evita que las celdas de las tablas de Banner 9 se separen en líneas verticales independientes.
 */
function reconstructPdfLines(items: any[]): string[] {
  const validItems: TextItemWithTransform[] = items.filter(
    (it): it is TextItemWithTransform =>
      Boolean(it && typeof it.str === 'string' && Array.isArray(it.transform) && it.transform.length >= 6)
  );

  if (validItems.length === 0) {
    return items
      .map((it: any) => ('str' in it ? it.str : ''))
      .filter((s: string) => s.trim().length > 0);
  }

  // Agrupar por coordenada Y con tolerancia de 3.5px
  const lineGroups: { y: number; items: TextItemWithTransform[] }[] = [];

  for (const item of validItems) {
    const y = item.transform[5];
    let group = lineGroups.find(g => Math.abs(g.y - y) <= 3.5);
    if (group) {
      group.items.push(item);
    } else {
      lineGroups.push({ y, items: [item] });
    }
  }

  // Ordenar de arriba hacia abajo (Y descendente en el sistema de coordenadas PDF)
  lineGroups.sort((a, b) => b.y - a.y);

  const lines: string[] = [];
  for (const group of lineGroups) {
    // Ordenar de izquierda a derecha (X ascendente: transform[4])
    group.items.sort((a, b) => a.transform[4] - b.transform[4]);
    let lineStr = '';
    for (let i = 0; i < group.items.length; i++) {
      const it = group.items[i];
      if (i > 0) {
        const prev = group.items[i - 1];
        const gap = it.transform[4] - (prev.transform[4] + (prev.width || 0));
        if (!lineStr.endsWith(' ') && !it.str.startsWith(' ') && gap > 3) {
          lineStr += ' ';
        }
      }
      lineStr += it.str;
    }
    lineStr = lineStr.replace(/\s+/g, ' ').trim();
    if (lineStr.length > 0) {
      lines.push(lineStr);
    }
  }

  return lines;
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const allLines: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageLines = reconstructPdfLines(textContent.items);
    allLines.push(...pageLines);
  }

  return allLines.join('\n');
}

