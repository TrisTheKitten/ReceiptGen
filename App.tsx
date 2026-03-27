
import React, { useState, useRef, useEffect } from 'react';
import { ReceiptForm } from './components/ReceiptForm';
import { CanvasWorkspace } from './components/CanvasWorkspace';
import { ReceiptData, DEFAULT_RECEIPT } from './types';
import { AlertTriangle, CheckCircle2, ScanText, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const NOTIFICATION_TIMEOUT_MS = 3000;
const MAX_BATCH_COUNT = 20;
const SCANNER_RANDOMIZE_DELAY_MS = 150;
const ZIP_CAPTURE_DELAY_MS = 250;
const ZIP_SEED_SPACING_MS = 1000;
const DESKTOP_BREAKPOINT = 768;

const getWindowWidth = () => (typeof window !== 'undefined' ? window.innerWidth : 1024);

export default function App() {
  const [data, setData] = useState<ReceiptData>(DEFAULT_RECEIPT);
  const [collection, setCollection] = useState<ReceiptData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingZip, setProcessingZip] = useState(false);
  const [notification, setNotification] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

  const [apiKey, setApiKey] = useState('');
  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
  };

  // Sidebar State
  const [sidebarWidth, setSidebarWidth] = useState(480);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(getWindowWidth);

  const previewRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showNotification = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), NOTIFICATION_TIMEOUT_MS);
  };

  const handleGenerateAI = async (category: string) => {
    const keyToUse = apiKey?.trim();
    if (!keyToUse) {
      showNotification("Please enter your Gemini API Key first", 'error');
      return;
    }
    setIsGenerating(true);
    try {
      // Use the passed category (lazada or 7-eleven)
      const { generateReceiptData } = await import('./services/geminiService');
      const generatedData = await generateReceiptData(category, data, keyToUse, data.language);
      if (generatedData) {
        setData(prev => ({
          ...prev,
          ...generatedData,
        }));
        showNotification("Receipt generated successfully", "success");
        setIsMobileMenuOpen(false);
      } else {
        showNotification("AI could not generate data.", 'error');
      }
    } catch (err) {
      console.error('Failed to generate receipt data.', err);
      showNotification("An error occurred during generation.", 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBulkGenerate = async (count: number, mode: 'random' | 'current', currentCategory?: string) => {
    const keyToUse = apiKey?.trim();
    if (!keyToUse) {
      showNotification("Please enter your Gemini API Key first", 'error');
      return;
    }
    if (count > MAX_BATCH_COUNT) count = MAX_BATCH_COUNT;
    setIsGenerating(true);

    try {
      const { generateReceiptBatch } = await import('./services/geminiService');
      const batchResults = await generateReceiptBatch(currentCategory || "7-eleven", count, keyToUse, data.language);

      if (batchResults.length === 0) {
        throw new Error("No data returned");
      }

      const newItems: ReceiptData[] = batchResults.map((item, idx) => {
        return {
          ...DEFAULT_RECEIPT,
          ...item,
          invoiceNumber: item.invoiceNumber || `${Math.floor(Math.random() * 9000000) + 1000000}`,
          scannerEffects: { ...data.scannerEffects }
        } as ReceiptData;
      });

      setCollection(prev => [...prev, ...newItems]);
      showNotification(`Successfully generated ${newItems.length} receipts!`, 'success');

    } catch (e) {
      console.error('Batch generation failed.', e);
      showNotification("Batch generation failed. Please try again.", 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToCollection = () => {
    setCollection(prev => [...prev, { ...data }]);
    showNotification("Added to collection", 'success');
  };

  const handleClearCollection = () => {
    setCollection([]);
    showNotification("Collection cleared", 'success');
  };

  const handleLoadFromCollection = (index: number) => {
    setData(collection[index]);
    showNotification("Loaded receipt into editor", 'success');
    setIsMobileMenuOpen(false);
  };

  const handleRemoveFromCollection = (index: number) => {
    setCollection(prev => prev.filter((_, i) => i !== index));
  };

  const [instanceSeed, setInstanceSeed] = useState(Date.now());

  const refreshSeed = () => setInstanceSeed(Date.now());

  const captureReceipt = async (): Promise<HTMLCanvasElement | null> => {
    if (!previewRef.current) return null;

    try {
      const { default: html2canvas } = await import('html2canvas');
      const originalElement = previewRef.current;

      const hasBgSurface = data.scannerEffects.enabled && data.scannerEffects.background !== 'none';

      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '-10000px';
      container.style.left = '-10000px';
      container.style.zIndex = '-1000';

      const paddingForRotation = hasBgSurface ? 20 : 60;
      container.style.width = `${originalElement.offsetWidth + paddingForRotation * 2}px`;
      container.style.height = `${originalElement.offsetHeight + paddingForRotation * 2}px`;
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.justifyContent = 'center';
      container.style.backgroundColor = hasBgSurface ? 'transparent' : '#f8fafc';

      document.body.appendChild(container);
      const clone = originalElement.cloneNode(true) as HTMLElement;
      clone.style.transform = 'none';
      clone.style.margin = '0';

      container.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: hasBgSurface ? null : '#f8fafc',
        logging: false,
        width: originalElement.offsetWidth + paddingForRotation * 2,
        height: originalElement.offsetHeight + paddingForRotation * 2,
        windowWidth: originalElement.offsetWidth + paddingForRotation * 2,
        windowHeight: originalElement.offsetHeight + paddingForRotation * 2,
        x: 0,
        y: 0
      });

      document.body.removeChild(container);
      return canvas;
    } catch (err) {
      console.error('Failed to capture receipt.', err);
      return null;
    }
  };

  const handleDownloadImage = async () => {
    if (data.scannerEffects.randomize) {
      setInstanceSeed(Date.now());
      await new Promise(resolve => setTimeout(resolve, SCANNER_RANDOMIZE_DELAY_MS));
    }

    const canvas = await captureReceipt();
    if (!canvas) {
      showNotification("Failed to generate image", 'error');
      return;
    }

    try {
      const link = document.createElement('a');
      link.download = `receipt-${data.invoiceNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showNotification("Image downloaded", 'success');
    } catch (err) {
      console.error('Image download failed.', err);
      showNotification("Failed to download image", 'error');
    }
  };

  const handleDownloadPDF = async () => {
    const canvas = await captureReceipt();
    if (!canvas) {
      showNotification("Failed to generate PDF", 'error');
      return;
    }

    try {
      const { default: jsPDF } = await import('jspdf');
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);

      const w = 80;
      const h = (imgProps.height * w) / imgProps.width;
      const x = (pdfWidth - w) / 2;
      pdf.addImage(imgData, 'PNG', x, 10, w, h);

      pdf.save(`invoice-${data.invoiceNumber}.pdf`);
      showNotification("PDF downloaded", 'success');
    } catch (err) {
      console.error('PDF download failed.', err);
      showNotification("Failed to download PDF", 'error');
    }
  };

  const handleDownloadZip = async () => {
    if (collection.length === 0) return;
    setProcessingZip(true);
    const originalData = { ...data };

    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      const folder = zip.folder("receipts");
      for (let i = 0; i < collection.length; i++) {
        setInstanceSeed(Date.now() + i * ZIP_SEED_SPACING_MS);
        setData(collection[i]);
        await new Promise(resolve => setTimeout(resolve, ZIP_CAPTURE_DELAY_MS));
        const canvas = await captureReceipt();
        if (canvas && folder) {
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
          if (blob) {
            folder.file(`receipt_${i + 1}_${collection[i].invoiceNumber}.png`, blob);
          }
        }
      }
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = "receipts_collection.zip";
      link.click();
      showNotification("ZIP downloaded successfully!", 'success');

    } catch (error) {
      console.error('ZIP generation failed.', error);
      showNotification("Failed to create ZIP file", 'error');
    } finally {
      setData(originalData);
      setInstanceSeed(Date.now());
      setProcessingZip(false);
    }
  };

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      if (newWidth >= 320 && newWidth <= 800) {
        setSidebarWidth(newWidth);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const isDesktop = windowWidth >= DESKTOP_BREAKPOINT;

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden select-none" aria-busy={isGenerating || processingZip}>
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-6 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[60] animate-in slide-in-from-top-4 duration-300 border ${notification.type === 'error' ? 'bg-red-50 text-red-900 border-red-100' : 'bg-emerald-800 text-white border-emerald-700'}`}
        >
          {notification.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} className="text-emerald-300" />}
          <span className="font-bold text-sm">{notification.msg}</span>
        </div>
      )}

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      <aside
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 flex flex-col shadow-2xl md:shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 ease-in-out select-text ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}
        style={{ width: isDesktop ? (isSidebarCollapsed ? 0 : sidebarWidth) : '85%', maxWidth: '400px', opacity: (isDesktop && isSidebarCollapsed) ? 0 : 1 }}
      >
        <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between bg-white whitespace-nowrap overflow-hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-orange-600 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200 shrink-0">
              <ScanText size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-gray-900 tracking-tight leading-none">ReceiptGEN</h1>
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mt-1">7/11 and Lazada Receipt Generator</p>
            </div>
          </div>
          <button
            className="md:hidden p-2 text-gray-400 hover:text-gray-600"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close sidebar"
          >
            <PanelLeftClose size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <ReceiptForm
            data={data}
            onChange={setData}
            onGenerateAI={handleGenerateAI}
            isGenerating={isGenerating}
            onDownloadImage={handleDownloadImage}
            onDownloadPDF={handleDownloadPDF}
            collection={collection}
            onAddToCollection={handleAddToCollection}
            onClearCollection={handleClearCollection}
            onBulkGenerate={handleBulkGenerate}
            onDownloadZip={handleDownloadZip}
            onLoadFromCollection={handleLoadFromCollection}
            onRemoveFromCollection={handleRemoveFromCollection}
            processingZip={processingZip}
            apiKey={apiKey}
            onApiKeyChange={handleApiKeyChange}
          />
        </div>

        <div
          onMouseDown={startResizing}
          className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-emerald-500 hover:opacity-100 opacity-0 transition-opacity z-50 hidden md:block"
        ></div>
      </aside>

      <button
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className="hidden md:flex absolute top-4 z-30 p-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl shadow-md hover:bg-gray-50 hover:text-emerald-700 hover:border-emerald-200 transition-all items-center justify-center"
        style={{ left: isSidebarCollapsed ? 20 : sidebarWidth - 50 }}
        title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-pressed={isSidebarCollapsed}
      >
        {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>

      <CanvasWorkspace data={data} previewRef={previewRef} onToggleMobileMenu={toggleMobileMenu} instanceSeed={instanceSeed} />
    </div>
  );
}
