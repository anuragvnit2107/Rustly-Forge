import React from 'react';
import {
  Play,
  Square,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Maximize2,
  Trash2,
  Edit2,
  Presentation,
} from 'lucide-react';
import { ExcalidrawElement, ViewportTransform } from '../types';

interface PresentationControllerProps {
  isPresentationMode: boolean;
  setIsPresentationMode: (active: boolean) => void;
  frames: ExcalidrawElement[];
  currentSlideIndex: number;
  setCurrentSlideIndex: (idx: number) => void;
  onAddFrameFromSelection: () => void;
  onDeleteFrame: (frameId: string) => void;
  onUpdateFrameTitle: (frameId: string, newTitle: string) => void;
  onFitFrame: (frame: ExcalidrawElement) => void;
}

export const PresentationController: React.FC<PresentationControllerProps> = ({
  isPresentationMode,
  setIsPresentationMode,
  frames,
  currentSlideIndex,
  setCurrentSlideIndex,
  onAddFrameFromSelection,
  onDeleteFrame,
  onUpdateFrameTitle,
  onFitFrame,
}) => {
  const currentFrame = frames[currentSlideIndex] || null;

  const handleNext = () => {
    if (currentSlideIndex < frames.length - 1) {
      const nextIdx = currentSlideIndex + 1;
      setCurrentSlideIndex(nextIdx);
      onFitFrame(frames[nextIdx]);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      const prevIdx = currentSlideIndex - 1;
      setCurrentSlideIndex(prevIdx);
      onFitFrame(frames[prevIdx]);
    }
  };

  if (!isPresentationMode) {
    return (
      <div className="flex items-center gap-1.5 p-1 bg-[#232329] border border-[#31303b] rounded-xl shadow-2xl backdrop-blur-md">
        <button
          onClick={() => {
            if (frames.length > 0) {
              setIsPresentationMode(true);
              onFitFrame(frames[0]);
            } else {
              onAddFrameFromSelection();
            }
          }}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#1d1d22] text-[#d0cfe0] hover:bg-[#2e2e38] hover:text-white transition flex items-center gap-1.5 border border-[#363544]"
          title="Start Step-by-Step Lecture Presentation [F5 / Slide Mode]"
        >
          <Presentation className="w-4 h-4 text-[#6965db]" />
          <span>Slides ({frames.length})</span>
        </button>

        <button
          onClick={onAddFrameFromSelection}
          className="p-1.5 rounded-lg text-[#8e8d9d] hover:text-white hover:bg-[#2e2e38] transition"
          title="Create Presentation Frame around canvas area"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-[#1c1c22]/95 border border-[#393847] rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
      {/* Slide Navigator */}
      <div className="flex items-center gap-1">
        <button
          onClick={handlePrev}
          disabled={currentSlideIndex <= 0}
          className="p-2 rounded-xl bg-[#282732] hover:bg-[#343343] disabled:opacity-40 disabled:hover:bg-[#282732] text-white transition"
          title="Previous Slide [Left Arrow]"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="px-3 py-1 bg-[#15151a] rounded-lg border border-[#2b2a36] text-center min-w-[140px]">
          <div className="text-[11px] font-mono text-[#a5a4f7]">
            Slide {frames.length > 0 ? currentSlideIndex + 1 : 0} of {frames.length}
          </div>
          <div className="text-xs font-semibold text-white truncate max-w-[160px]">
            {currentFrame?.frameTitle || `Step ${currentSlideIndex + 1}`}
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={currentSlideIndex >= frames.length - 1}
          className="p-2 rounded-xl bg-[#282732] hover:bg-[#343343] disabled:opacity-40 disabled:hover:bg-[#282732] text-white transition"
          title="Next Slide [Right Arrow / Spacebar]"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="w-[1px] h-6 bg-[#363544]" />

      {/* Frame Title quick edit */}
      {currentFrame && (
        <button
          onClick={() => {
            const nextTitle = prompt('Rename Slide Title:', currentFrame.frameTitle || '');
            if (nextTitle !== null) {
              onUpdateFrameTitle(currentFrame.id, nextTitle.trim() || `Step ${currentSlideIndex + 1}`);
            }
          }}
          className="p-2 rounded-xl bg-[#282732] hover:bg-[#343343] text-[#b3b2c2] hover:text-white transition"
          title="Rename this Slide"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Re-center / Fit Frame */}
      {currentFrame && (
        <button
          onClick={() => onFitFrame(currentFrame)}
          className="p-2 rounded-xl bg-[#282732] hover:bg-[#343343] text-[#b3b2c2] hover:text-white transition"
          title="Fit this frame to screen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Exit presentation */}
      <button
        onClick={() => setIsPresentationMode(false)}
        className="p-2 rounded-xl bg-[#e03131]/20 hover:bg-[#e03131]/30 text-[#ff8787] hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
        title="Exit Presentation Mode [Esc]"
      >
        <X className="w-4 h-4" />
        <span>Exit</span>
      </button>
    </div>
  );
};
