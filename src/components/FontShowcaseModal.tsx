import React, { useState } from 'react';
import { X, Plus, Sparkles, Check } from 'lucide-react';
import { FontFamily } from '../types';

interface FontShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertTextWithFont: (text: string, font: FontFamily) => void;
}

export const FontShowcaseModal: React.FC<FontShowcaseModalProps> = ({
  isOpen,
  onClose,
  onInsertTextWithFont,
}) => {
  const [customText, setCustomText] = useState('ANURAG SONI\nanurag soni');
  const [copiedFont, setCopiedFont] = useState<string | null>(null);

  if (!isOpen) return null;

  const fontList: {
    id: FontFamily;
    name: string;
    displayName: string;
    styleDesc: string;
    fontClass: string;
  }[] = [
    {
      id: 'excalifont',
      name: 'Scribble',
      displayName: 'Scribble (Handwritten)',
      styleDesc: 'Natural hand-drawn style with fluid organic strokes',
      fontClass: 'font-excalifont',
    },
    {
      id: 'comic-shanns',
      name: 'Casual',
      displayName: 'Casual',
      styleDesc: 'Casual, monospaced-style comic lettering',
      fontClass: 'font-comic-shanns',
    },
    {
      id: 'lilita-one',
      name: 'Heavy',
      displayName: 'Heavy',
      styleDesc: 'Chunky, bold, display typeface with high impact',
      fontClass: 'font-lilita-one',
    },
    {
      id: 'nunito',
      name: 'CleanSans',
      displayName: 'CleanSans',
      styleDesc: 'Clean, modern, balanced geometric rounded sans',
      fontClass: 'font-nunito',
    },
  ];

  const handleInsert = (font: FontFamily) => {
    onInsertTextWithFont(customText, font);
    setCopiedFont(font);
    setTimeout(() => {
      setCopiedFont(null);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none">
      <div
        id="font-showcase-modal"
        className="w-full max-w-4xl bg-[#1e1e24] border border-[#343342] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2d2c38] flex items-center justify-between bg-[#23232a]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#6965db]" />
            <div>
              <h2 className="text-base font-bold text-white">
                Font Styles Showcase
              </h2>
              <p className="text-xs text-[#9594a5]">
                Typography styles: Scribble, Casual, Heavy, and CleanSans
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#31303b] text-[#8e8d9e] hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input custom text */}
        <div className="p-4 bg-[#18181d] border-b border-[#2d2c38] flex items-center gap-3">
          <label className="text-xs font-semibold text-[#8e8d9e] whitespace-nowrap">
            Sample Text:
          </label>
          <input
            type="text"
            value={customText.replace('\n', ' ')}
            onChange={(e) => setCustomText(`${e.target.value.toUpperCase()}\n${e.target.value.toLowerCase()}`)}
            className="flex-1 bg-[#23232a] border border-[#343342] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#6965db]"
            placeholder="Type text to preview..."
          />
        </div>

        {/* 4-Column Font Grid matching Screenshot 4 */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-4 gap-4">
          {fontList.map((f) => (
            <div
              key={f.id}
              className="flex flex-col bg-[#23232a] border border-[#31303b] rounded-xl overflow-hidden shadow-lg hover:border-[#6965db]/50 transition"
            >
              {/* Column Header */}
              <div className="p-3 bg-[#2a2a33] border-b border-[#363544] flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-semibold text-[#a5a4f7]">
                    {f.name}
                  </span>
                  <div className="text-[10px] text-[#78778a]">{f.styleDesc}</div>
                </div>
              </div>

              {/* Font Display Body */}
              <div className="flex-1 p-5 flex flex-col justify-center min-h-[140px] bg-[#1a1a20]">
                <div className={`text-xl text-white tracking-wide leading-snug ${f.fontClass}`}>
                  <div>{customText.split('\n')[0] || 'ANURAG SONI'}</div>
                  <div className="opacity-90">{customText.split('\n')[1] || 'anurag soni'}</div>
                </div>
              </div>

              {/* Insert onto Canvas Button */}
              <div className="p-2.5 bg-[#23232a] border-t border-[#31303b] flex items-center justify-end">
                <button
                  onClick={() => handleInsert(f.id)}
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#363544] hover:bg-[#6965db] text-white transition flex items-center justify-center gap-1.5 shadow"
                >
                  {copiedFont === f.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      Added!
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Insert on Canvas
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#2d2c38] bg-[#1b1b22] flex items-center justify-between text-xs text-[#8e8d9e]">
          <span>Tip: You can change the font of any selected text element using the left properties panel.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#2e2e38] text-white hover:bg-[#393946] transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
