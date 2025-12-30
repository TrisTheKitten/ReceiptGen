import React, { useEffect, useRef, useState } from 'react';
import { Maximize, Menu, MousePointer2, ZoomIn, ZoomOut } from 'lucide-react';
import { ReceiptData } from '../types';
import { ReceiptPreview } from './ReceiptPreview';

interface Props {
  data: ReceiptData;
  previewRef: React.RefObject<HTMLDivElement | null>;
  onToggleMobileMenu: () => void;
}

const DEFAULT_ZOOM = 0.85;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3;

export const CanvasWorkspace: React.FC<Props> = ({ data, previewRef, onToggleMobileMenu }) => {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const panRef = useRef(pan);
  const zoomRef = useRef(zoom);
  const rafRef = useRef<number | null>(null);

  const scheduleRender = () => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      setPan({ ...panRef.current });
      setZoom(zoomRef.current);
    });
  };

  const updatePan = (nextPan: { x: number; y: number }) => {
    panRef.current = nextPan;
    scheduleRender();
  };

  const updateZoom = (nextZoom: number) => {
    zoomRef.current = nextZoom;
    scheduleRender();
  };

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault();
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    updatePan({ x: panRef.current.x + dx, y: panRef.current.y + dy });
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
       e.preventDefault();
       const delta = e.deltaY > 0 ? -0.1 : 0.1;
       updateZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomRef.current + delta)));
    } else {
       updatePan({ x: panRef.current.x - e.deltaX, y: panRef.current.y - e.deltaY });
    }
  };

  const resetView = () => {
      updateZoom(DEFAULT_ZOOM);
      updatePan({ x: 0, y: 0 });
  };

  return (
    <main className="flex-1 flex flex-col relative bg-slate-50/50 overflow-hidden w-full">
       <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none" 
            style={{ 
                backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)', 
                backgroundSize: '24px 24px',
                backgroundPosition: `${pan.x}px ${pan.y}px` 
            }}>
       </div>
       
       <div className="h-16 flex items-center justify-between px-4 md:px-8 z-10 sticky top-0 pointer-events-none w-full">
           <button 
               onClick={onToggleMobileMenu}
               className="md:hidden pointer-events-auto p-2.5 bg-white text-gray-700 rounded-xl shadow-md border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all"
           >
               <Menu size={20} />
           </button>

           <div className="pointer-events-auto bg-white/90 backdrop-blur-md border border-gray-200/60 rounded-full px-4 py-1.5 shadow-sm flex items-center gap-4 ml-auto">
               <div className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                   <MousePointer2 size={12} />
                   <span>Canvas</span>
               </div>
               <div className="hidden md:block w-px h-4 bg-gray-200"></div>
               <div className="flex items-center gap-1">
                  <button onClick={() => updateZoom(Math.max(MIN_ZOOM, zoomRef.current - 0.1))} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition-all" title="Zoom Out">
                      <ZoomOut size={16} />
                  </button>
                  <span className="text-xs font-mono font-medium w-10 text-center text-gray-700">{Math.round(zoom * 100)}%</span>
                  <button onClick={() => updateZoom(Math.min(MAX_ZOOM, zoomRef.current + 0.1))} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition-all" title="Zoom In">
                      <ZoomIn size={16} />
                  </button>
               </div>
               <div className="w-px h-4 bg-gray-200"></div>
               <button onClick={resetView} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition-all" title="Reset View">
                  <Maximize size={16} />
               </button>
           </div>
       </div>

       <div 
          ref={canvasContainerRef}
          className={`flex-1 flex items-center justify-center relative outline-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'} w-full`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
       >
           <div 
              className="transition-transform duration-75 ease-out shadow-2xl rounded-sm pointer-events-none origin-center" 
              style={{ 
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
              }}
           >
              <div className="pointer-events-auto bg-white">
                  <ReceiptPreview data={data} previewRef={previewRef} />
              </div>
           </div>
       </div>
    </main>
  );
};
