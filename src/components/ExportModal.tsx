import React, { useState } from 'react';
import { X, Download, Copy, Check, Image as ImageIcon, FileCode, FileJson } from 'lucide-react';
import { ExcalidrawElement } from '../types';
import { getBoundingBox } from '../sketchEngine';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  elements: ExcalidrawElement[];
  canvasBackground: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  canvasRef,
  elements,
  canvasBackground,
}) => {
  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'json'>('png');
  const [includeBackground, setIncludeBackground] = useState(true);
  const [scale, setScale] = useState<number>(2);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (exportFormat === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(elements, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `rustly-forge-drawing-${Date.now()}.json`;
      a.click();
      return;
    }

    if (exportFormat === 'png') {
      if (!canvasRef.current) return;
      const originalCanvas = canvasRef.current;
      
      // Calculate active elements bounds
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      const activeElements = elements.filter(e => !e.isDeleted);
      
      if (activeElements.length > 0) {
        for (const el of activeElements) {
          const b = getBoundingBox(el);
          if (b.minX < minX) minX = b.minX;
          if (b.minY < minY) minY = b.minY;
          if (b.maxX > maxX) maxX = b.maxX;
          if (b.maxY > maxY) maxY = b.maxY;
        }
      } else {
        minX = 0; minY = 0; maxX = 800; maxY = 600;
      }

      const padding = 40;
      const exportWidth = (maxX - minX + padding * 2) * scale;
      const exportHeight = (maxY - minY + padding * 2) * scale;

      const offscreen = document.createElement('canvas');
      offscreen.width = exportWidth;
      offscreen.height = exportHeight;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return;

      if (includeBackground) {
        ctx.fillStyle = canvasBackground;
        ctx.fillRect(0, 0, exportWidth, exportHeight);
      }

      // Draw canvas snapshot
      ctx.drawImage(
        originalCanvas,
        0, 0, originalCanvas.width, originalCanvas.height,
        0, 0, exportWidth, exportHeight
      );

      const a = document.createElement('a');
      a.href = offscreen.toDataURL('image/png');
      a.download = `rustly-forge-drawing-${Date.now()}.png`;
      a.click();
    }

    if (exportFormat === 'svg') {
      const svgString = generateSvg(elements, includeBackground ? canvasBackground : 'none');
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rustly-forge-drawing-${Date.now()}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleCopy = async () => {
    if (exportFormat === 'svg') {
      const svg = generateSvg(elements, includeBackground ? canvasBackground : 'none');
      await navigator.clipboard.writeText(svg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    if (exportFormat === 'json') {
      await navigator.clipboard.writeText(JSON.stringify(elements, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    if (exportFormat === 'png' && canvasRef.current) {
      canvasRef.current.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            alert('Direct PNG copy is not supported in this browser context.');
          }
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        id="export-modal"
        className="w-full max-w-md bg-[#232329] border border-[#31303b] rounded-2xl shadow-2xl p-6 text-[#d4d4df]"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#31303b]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-[#6965db]" />
            Export Image
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#2e2e38] text-[#8e8d9e] hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 flex flex-col gap-4">
          {/* Format selector */}
          <div>
            <label className="text-xs font-semibold text-[#8e8d9e] uppercase tracking-wider block mb-2">
              Format
            </label>
            <div className="grid grid-cols-3 gap-2 bg-[#1b1b20] p-1.5 rounded-xl border border-[#2f2e3a]">
              {[
                { id: 'png' as const, label: 'PNG', icon: <ImageIcon className="w-4 h-4" /> },
                { id: 'svg' as const, label: 'SVG', icon: <FileCode className="w-4 h-4" /> },
                { id: 'json' as const, label: 'JSON', icon: <FileJson className="w-4 h-4" /> },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setExportFormat(fmt.id)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    exportFormat === fmt.id
                      ? 'bg-[#4a47b1] text-white shadow'
                      : 'text-[#8e8d9e] hover:text-white hover:bg-[#282830]'
                  }`}
                >
                  {fmt.icon}
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scale & Options (for PNG) */}
          {exportFormat === 'png' && (
            <div>
              <label className="text-xs font-semibold text-[#8e8d9e] uppercase tracking-wider block mb-2">
                Scale
              </label>
              <div className="grid grid-cols-3 gap-2 bg-[#1b1b20] p-1 rounded-lg border border-[#2f2e3a]">
                {[1, 2, 3].map((s) => (
                  <button
                    key={s}
                    onClick={() => setScale(s)}
                    className={`py-1.5 text-xs font-medium rounded transition ${
                      scale === s
                        ? 'bg-[#4a47b1] text-white'
                        : 'text-[#8e8d9e] hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Background Toggle */}
          <label className="flex items-center justify-between p-3 bg-[#1b1b20] rounded-xl border border-[#2f2e3a] cursor-pointer">
            <span className="text-sm font-medium">Include Canvas Background</span>
            <input
              type="checkbox"
              checked={includeBackground}
              onChange={(e) => setIncludeBackground(e.target.checked)}
              className="w-4 h-4 accent-[#6965db] rounded cursor-pointer"
            />
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#31303b]">
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2b2b33] text-[#d4d4df] hover:bg-[#34343e] hover:text-white transition flex items-center gap-2 border border-[#3e3d4c]"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
          <button
            onClick={handleDownload}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#6965db] hover:bg-[#5b57d1] text-white transition flex items-center gap-2 shadow-lg shadow-[#6965db]/20"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

function generateSvg(elements: ExcalidrawElement[], bg: string): string {
  let minX = 0, minY = 0, maxX = 1200, maxY = 800;
  if (elements.length > 0) {
    minX = Math.min(...elements.map(e => e.x)) - 30;
    minY = Math.min(...elements.map(e => e.y)) - 30;
    maxX = Math.max(...elements.map(e => e.x + (e.width || 0))) + 30;
    maxY = Math.max(...elements.map(e => e.y + (e.height || 0))) + 30;
  }
  const w = Math.max(100, maxX - minX);
  const h = Math.max(100, maxY - minY);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${minX} ${minY} ${w} ${h}">`;
  if (bg !== 'none') {
    svg += `<rect x="${minX}" y="${minY}" width="${w}" height="${h}" fill="${bg}"/>`;
  }

  for (const el of elements) {
    if (el.isDeleted) continue;
    if (el.type === 'rectangle') {
      svg += `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" fill="${el.backgroundColor === 'transparent' ? 'none' : el.backgroundColor}" rx="4"/>`;
    } else if (el.type === 'ellipse') {
      svg += `<ellipse cx="${el.x + el.width / 2}" cy="${el.y + el.height / 2}" rx="${Math.abs(el.width / 2)}" ry="${Math.abs(el.height / 2)}" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" fill="${el.backgroundColor === 'transparent' ? 'none' : el.backgroundColor}"/>`;
    } else if (el.type === 'line' || el.type === 'arrow') {
      const p1 = el.points[0] || { x: 0, y: 0 };
      const p2 = el.points[1] || { x: el.width, y: el.height };
      svg += `<line x1="${el.x + p1.x}" y1="${el.y + p1.y}" x2="${el.x + p2.x}" y2="${el.y + p2.y}" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}"/>`;
    } else if (el.type === 'text' && el.text) {
      svg += `<text x="${el.x}" y="${el.y + (el.fontSize || 20)}" fill="${el.strokeColor}" font-size="${el.fontSize || 20}" font-family="Caveat, cursive">${el.text.replace(/\n/g, ' ')}</text>`;
    }
  }

  svg += '</svg>';
  return svg;
}
