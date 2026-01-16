
import React, { useState } from 'react';
import { ReceiptData, DEFAULT_SCANNER_EFFECTS, randomizeScannerEffects, BackgroundStyle } from '../types';
import { calculateItemTotal, calculateTotals } from '../utils/receiptMath';
import { Trash2, RefreshCw, ChevronDown, ChevronRight, Edit, Download, FileText, Eye, EyeOff, Key, Shuffle, SlidersHorizontal, Image } from 'lucide-react';

interface Props {
  data: ReceiptData;
  onChange: (data: ReceiptData) => void;
  onGenerateAI: (category: string) => Promise<void>;
  isGenerating: boolean;
  onDownloadImage: () => void;
  onDownloadPDF: () => void;
  collection: ReceiptData[];
  onAddToCollection: () => void;
  onClearCollection: () => void;
  onBulkGenerate: (count: number, mode: 'random' | 'current', category?: string) => void;
  onDownloadZip: () => void;
  onLoadFromCollection: (index: number) => void;
  onRemoveFromCollection: (index: number) => void;
  processingZip: boolean;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

const NumberInput = ({ 
  value, 
  onChange, 
  min = 0, 
  step = 1, 
  prefix, 
  className = "",
  placeholder,
  align = "left"
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  prefix?: string;
  className?: string;
  placeholder?: string;
  align?: "left" | "center" | "right";
}) => {
  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(Number((value + step).toFixed(2)));
  };
  
  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(Math.max(min, Number((value - step).toFixed(2))));
  };
  
  return (
    <div className={`relative flex items-center group ${className}`}>
      {prefix && <span className="absolute left-3 text-gray-500 text-xs pointer-events-none z-10 font-bold">{prefix}</span>}
      <input
        type="number"
        value={value}
        onChange={(e) => {
            const val = parseFloat(e.target.value);
            onChange(isNaN(val) ? 0 : val);
        }}
        className={`w-full h-11 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-1 focus:ring-black focus:border-black outline-none bg-white placeholder-gray-400 transition-all font-medium
          ${prefix ? 'pl-8' : 'pl-3'} pr-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none hover:border-gray-300 ${align === 'center' ? 'text-center' : 'text-left'}`}
        placeholder={placeholder}
      />
      <div className="absolute right-0 inset-y-0 w-9 flex flex-col border-l border-gray-200">
        <button 
          onClick={handleIncrement}
          className="flex-1 hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-black transition-colors rounded-tr-lg border-b border-gray-200"
          type="button"
          tabIndex={-1}
        >
          <ChevronUp size={12} />
        </button>
        <button 
          onClick={handleDecrement}
          className="flex-1 hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-black transition-colors rounded-br-lg"
          type="button"
          tabIndex={-1}
        >
          <ChevronDown size={12} />
        </button>
      </div>
    </div>
  );
};

const ChevronUp = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
);

const ScannerSlider = ({ 
    label, 
    value, 
    min, 
    max, 
    step, 
    unit = "",
    onChange 
}: { 
    label: string; 
    value: number; 
    min: number; 
    max: number; 
    step: number;
    unit?: string;
    onChange: (value: number) => void;
}) => (
    <div className="space-y-1.5">
        <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</span>
            <span className="text-[10px] font-mono text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                {value.toFixed(step < 1 ? 1 : 0)}{unit}
            </span>
        </div>
        <input 
            type="range" 
            min={min} 
            max={max} 
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-black 
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
        />
    </div>
);

const InputGroup = ({ label, children, className = "" }: { label: string, children?: React.ReactNode, className?: string }) => (
    <div className={`mb-4 ${className}`}>
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-0.5">{label}</label>
        {children}
    </div>
);

const Section = ({ 
    title, 
    children, 
    isOpen, 
    onToggle,
    isSummary
}: { 
    title: string, 
    children?: React.ReactNode, 
    isOpen: boolean, 
    onToggle: () => void,
    isSummary?: string
}) => (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-3 bg-white">
        <button 
            onClick={onToggle}
            className={`w-full flex items-center justify-between p-4 text-sm font-semibold transition-colors ${isOpen ? 'bg-gray-50 text-black' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
            <div className="flex-1 text-left">
                <div className="text-sm font-bold tracking-tight">{title}</div>
                {isSummary && !isOpen && <div className="text-[11px] text-gray-400 font-normal truncate max-w-[200px] mt-0.5">{isSummary}</div>}
            </div>
            <div className={`text-gray-400`}>
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
        </button>
        {isOpen && (
            <div className="p-4 border-t border-gray-100 bg-white">
                {children}
            </div>
        )}
    </div>
);

export const ReceiptForm: React.FC<Props> = ({ 
  data, 
  onChange, 
  onGenerateAI, 
  isGenerating,
  onDownloadImage,
  onDownloadPDF,
  collection,
  onAddToCollection,
  onClearCollection,
  onBulkGenerate,
  onDownloadZip,
  onLoadFromCollection,
  onRemoveFromCollection,
  processingZip,
  apiKey,
  onApiKeyChange
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'bulk'>('editor');
  const [showApiKey, setShowApiKey] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
      'seller': false,
      'buyer': false,
      'items': true,
      'footer': true
  });
  const [bulkCount, setBulkCount] = useState(5);
  
  const toggleSection = (key: string) => {
      setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (['savings', 'memberPointsEarned', 'memberPointsTotal', 'cashAmount', 'changeAmount'].includes(name)) {
        onChange({ ...data, [name]: parseFloat(value) || 0 });
    } else {
        onChange({ ...data, [name]: value });
    }
  };

  const handleTemplateChange = (template: 'thermal' | 'lazada') => {
      if (template === 'lazada') {
          onChange({
              ...data,
              templateStyle: 'lazada',
              sellerName: "Lazada Express Limited",
              sellerAddress: "No. 689, Bhiraj Tower, 29th floor, Soi Sukhumvit 35...",
              buyerAddress: data.buyerAddress || "123 Example Rd, Bangkok",
              refOrderNumber: data.refOrderNumber || "962669028613629"
          });
      } else {
          onChange({
              ...data,
              templateStyle: 'thermal',
              sellerName: "CP ALL, 7-Eleven",
              sellerAddress: "สาขาตัวอย่าง (0000)"
          });
      }
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...data.items];
    const updatedItem = { ...newItems[index] };
    if (field === 'description') {
      updatedItem.description = String(value);
    } else if (field === 'quantity') {
      const numericValue = typeof value === 'number' ? value : parseFloat(value);
      updatedItem.quantity = Number.isFinite(numericValue) ? numericValue : 0;
    } else if (field === 'unitPrice') {
      const numericValue = typeof value === 'number' ? value : parseFloat(value);
      updatedItem.unitPrice = Number.isFinite(numericValue) ? numericValue : 0;
    }
    updatedItem.total = calculateItemTotal(updatedItem.quantity, updatedItem.unitPrice);
    newItems[index] = updatedItem;

    const { subtotal, grandTotal, vatAmount } = calculateTotals(newItems, data.savings || 0, data.vatRate);
    onChange({ ...data, items: newItems, subtotal, vatAmount, grandTotal });
  };

  const addItem = () => {
    const newItems = [...data.items, { id: Date.now().toString(), description: 'Item Name', quantity: 1, unitPrice: 10, total: 10 }];
    const { subtotal, grandTotal, vatAmount } = calculateTotals(newItems, data.savings || 0, data.vatRate);
    onChange({ ...data, items: newItems, subtotal, vatAmount, grandTotal });
  };

  const removeItem = (index: number) => {
    const newItems = data.items.filter((_, i) => i !== index);
    const { subtotal, grandTotal, vatAmount } = calculateTotals(newItems, data.savings || 0, data.vatRate);
    onChange({ ...data, items: newItems, subtotal, vatAmount, grandTotal });
  };

  const inputBaseClass = "w-full h-11 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all";
  
  const isLazada = data.templateStyle === 'lazada';
  const categoryId = isLazada ? 'lazada' : '7-eleven';

  return (
    <div className="bg-white h-full flex flex-col font-sans">
      <div className="px-5 pt-5 pb-3 bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="bg-gray-100 p-1 rounded-lg flex w-full relative">
            <button 
                onClick={() => setActiveTab('editor')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'editor' 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
            >
                Editor
            </button>
            <button 
                onClick={() => setActiveTab('bulk')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'bulk' 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
            >
                Collection ({collection.length})
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
        {activeTab === 'editor' ? (
          <div className="space-y-4 pb-24">
            
            <div className="bg-white p-1 rounded-xl border border-gray-200">
                <div className="grid grid-cols-2 gap-1">
                    <button 
                        onClick={() => handleTemplateChange('thermal')}
                        className={`py-3 rounded-lg text-xs font-bold transition-all border ${!isLazada ? 'bg-black text-white border-black' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                    >
                        7-Eleven (Thermal)
                    </button>
                    <button 
                        onClick={() => handleTemplateChange('lazada')}
                        className={`py-3 rounded-lg text-xs font-bold transition-all border ${isLazada ? 'bg-black text-white border-black' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                    >
                        Lazada (A4)
                    </button>
                </div>
            </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex flex-col gap-4">
                    <div className="mb-1">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-0.5 block">
                            Gemini API Key
                        </label>
                        <div className="relative">
                            <input 
                                type={showApiKey ? "text" : "password"} 
                                value={apiKey || ''}
                                onChange={(e) => onApiKeyChange?.(e.target.value)}
                                placeholder="Enter your Gemini API Key"
                                className="w-full h-11 pl-10 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Key size={16} />
                            </div>
                            <button 
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                                type="button"
                                aria-label={showApiKey ? "Hide API key" : "Show API key"}
                            >
                                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <p className="mt-2 text-[11px] text-gray-500 font-bold uppercase tracking-wide">
                            Your key stays in memory only for this session.
                        </p>
                    </div>
                    
                    <div className="h-px bg-gray-100 my-1"></div>

                    <div>
                        <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                            {isLazada ? 'Lazada Data Generator' : '7-Eleven Data Generator'}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider font-bold">
                            {isLazada ? 'Logistics & tracking info' : 'Items & member data'}
                        </p>
                    </div>

                    <button 
                        onClick={() => onGenerateAI(categoryId)}
                        disabled={isGenerating}
                        className="w-full h-11 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isGenerating ? <RefreshCw className="animate-spin w-4 h-4" /> : 'Auto-Generate Details'}
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal size={14} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Scanner Effects</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => {
                                const randomized = randomizeScannerEffects();
                                onChange({
                                    ...data, 
                                    scannerEffects: { 
                                        ...data.scannerEffects, 
                                        ...randomized,
                                        randomize: false
                                    }
                                });
                            }}
                            className="h-7 px-2.5 rounded-md text-[10px] font-bold transition-all border border-gray-200 text-gray-500 hover:border-black hover:text-black flex items-center gap-1"
                            title="Randomize settings"
                            type="button"
                            aria-label="Randomize scanner settings"
                        >
                            <Shuffle size={12} />
                        </button>
                        <button 
                            onClick={() => onChange({
                                ...data, 
                                scannedLook: !data.scannedLook,
                                scannerEffects: { ...data.scannerEffects, enabled: !data.scannerEffects.enabled }
                            })}
                            className={`h-7 px-3 rounded-md text-[10px] font-bold transition-all border ${data.scannerEffects.enabled ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200'}`}
                            aria-pressed={data.scannerEffects.enabled}
                        >
                            {data.scannerEffects.enabled ? 'ON' : 'OFF'}
                        </button>
                    </div>
                </div>
                
                {data.scannerEffects.enabled && (
                    <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Auto-Randomize on Export</span>
                            <button 
                                onClick={() => onChange({
                                    ...data, 
                                    scannerEffects: { ...data.scannerEffects, randomize: !data.scannerEffects.randomize }
                                })}
                                className={`h-7 px-3 rounded-md text-[10px] font-bold transition-all border ${data.scannerEffects.randomize ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-400 border-gray-200'}`}
                                aria-pressed={data.scannerEffects.randomize}
                            >
                                {data.scannerEffects.randomize ? 'YES' : 'NO'}
                            </button>
                        </div>

                        <div className="h-px bg-gray-100" />

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Image size={12} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Background Surface</span>
                            </div>
                            <div className="grid grid-cols-5 gap-1.5">
                                {([
                                    { id: 'none', label: 'None', color: 'bg-white border-gray-300' },
                                    { id: 'dark-floor', label: 'Dark', color: 'bg-gradient-to-br from-gray-800 to-gray-900' },
                                    { id: 'wood', label: 'Wood', color: 'bg-gradient-to-br from-amber-800 to-amber-900' },
                                    { id: 'marble', label: 'Marble', color: 'bg-gradient-to-br from-gray-200 to-gray-300' },
                                    { id: 'concrete', label: 'Concrete', color: 'bg-gradient-to-br from-gray-500 to-gray-600' },
                                ] as { id: BackgroundStyle; label: string; color: string }[]).map(bg => (
                                    <button
                                        key={bg.id}
                                        onClick={() => onChange({
                                            ...data,
                                            scannerEffects: { ...data.scannerEffects, background: bg.id }
                                        })}
                                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                                            data.scannerEffects.background === bg.id 
                                                ? 'border-black' 
                                                : 'border-transparent hover:border-gray-200'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-md ${bg.color} ${bg.id === 'none' ? 'border border-gray-200' : ''}`} />
                                        <span className="text-[9px] font-bold text-gray-500 uppercase">{bg.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-gray-100" />

                        <ScannerSlider 
                            label="Rotation" 
                            value={data.scannerEffects.rotation} 
                            min={-5} max={5} step={0.1}
                            unit="°"
                            onChange={(v) => onChange({...data, scannerEffects: {...data.scannerEffects, rotation: v}})}
                        />
                        
                        <div className="grid grid-cols-2 gap-3">
                            <ScannerSlider 
                                label="Tilt X" 
                                value={data.scannerEffects.perspectiveX} 
                                min={-8} max={8} step={0.5}
                                unit="°"
                                onChange={(v) => onChange({...data, scannerEffects: {...data.scannerEffects, perspectiveX: v}})}
                            />
                            <ScannerSlider 
                                label="Tilt Y" 
                                value={data.scannerEffects.perspectiveY} 
                                min={-6} max={6} step={0.5}
                                unit="°"
                                onChange={(v) => onChange({...data, scannerEffects: {...data.scannerEffects, perspectiveY: v}})}
                            />
                        </div>

                        <div className="h-px bg-gray-100" />

                        <div className="grid grid-cols-2 gap-3">
                            <ScannerSlider 
                                label="Noise" 
                                value={data.scannerEffects.noiseIntensity} 
                                min={0} max={50} step={1}
                                unit="%"
                                onChange={(v) => onChange({...data, scannerEffects: {...data.scannerEffects, noiseIntensity: v}})}
                            />
                            <ScannerSlider 
                                label="Vignette" 
                                value={data.scannerEffects.vignetteIntensity} 
                                min={0} max={80} step={1}
                                unit="%"
                                onChange={(v) => onChange({...data, scannerEffects: {...data.scannerEffects, vignetteIntensity: v}})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <ScannerSlider 
                                label="Warmth" 
                                value={data.scannerEffects.warmth} 
                                min={-10} max={25} step={1}
                                unit="%"
                                onChange={(v) => onChange({...data, scannerEffects: {...data.scannerEffects, warmth: v}})}
                            />
                            <ScannerSlider 
                                label="Blur" 
                                value={data.scannerEffects.blur} 
                                min={0} max={1.5} step={0.05}
                                unit="px"
                                onChange={(v) => onChange({...data, scannerEffects: {...data.scannerEffects, blur: v}})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <ScannerSlider 
                                label="Brightness" 
                                value={data.scannerEffects.brightness} 
                                min={80} max={110} step={1}
                                unit="%"
                                onChange={(v) => onChange({...data, scannerEffects: {...data.scannerEffects, brightness: v}})}
                            />
                            <ScannerSlider 
                                label="Contrast" 
                                value={data.scannerEffects.contrast} 
                                min={80} max={140} step={1}
                                unit="%"
                                onChange={(v) => onChange({...data, scannerEffects: {...data.scannerEffects, contrast: v}})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <ScannerSlider 
                                label="Shadows" 
                                value={data.scannerEffects.shadowIntensity} 
                                min={0} max={60} step={1}
                                unit="%"
                                onChange={(v) => onChange({...data, scannerEffects: {...data.scannerEffects, shadowIntensity: v}})}
                            />
                            <ScannerSlider 
                                label="Paper Texture" 
                                value={data.scannerEffects.paperTexture} 
                                min={0} max={40} step={1}
                                unit="%"
                                onChange={(v) => onChange({...data, scannerEffects: {...data.scannerEffects, paperTexture: v}})}
                            />
                        </div>

                        <button 
                            onClick={() => onChange({...data, scannerEffects: { ...DEFAULT_SCANNER_EFFECTS }})}
                            className="w-full h-9 text-[10px] font-bold text-gray-500 border border-gray-200 rounded-lg hover:border-gray-300 hover:text-gray-700 transition-all"
                        >
                            RESET TO DEFAULTS
                        </button>
                    </div>
                )}
            </div>

            <Section title="Seller Info" isOpen={openSections['seller']} onToggle={() => toggleSection('seller')} isSummary={data.sellerName}>
                <InputGroup label="Company Name">
                     <input type="text" name="sellerName" value={data.sellerName} onChange={handleInputChange} className={inputBaseClass} />
                </InputGroup>
                <InputGroup label="Address">
                    <input type="text" name="sellerAddress" value={data.sellerAddress} onChange={handleInputChange} className={inputBaseClass} placeholder="Address" />
                </InputGroup>
                <div className="grid grid-cols-2 gap-3">
                    <InputGroup label="Tax ID" className="mb-0">
                        <input type="text" name="sellerTaxId" value={data.sellerTaxId} onChange={handleInputChange} className={inputBaseClass} />
                    </InputGroup>
                    <InputGroup label="Branch" className="mb-0">
                        <input type="text" name="branchCode" value={data.branchCode} onChange={handleInputChange} className={inputBaseClass} />
                    </InputGroup>
                </div>
            </Section>

            <Section title="Customer Info" isOpen={openSections['buyer']} onToggle={() => toggleSection('buyer')} isSummary={data.buyerName}>
                 <InputGroup label="Customer Name">
                    <input type="text" name="buyerName" value={data.buyerName} onChange={handleInputChange} className={inputBaseClass} />
                </InputGroup>
                
                {isLazada && (
                     <InputGroup label="Customer Address">
                        <input type="text" name="buyerAddress" value={data.buyerAddress || ''} onChange={handleInputChange} className={inputBaseClass} />
                    </InputGroup>
                )}

                {!isLazada && (
                    <div className="grid grid-cols-2 gap-3">
                        <InputGroup label="Member ID">
                            <input type="text" name="memberId" value={data.memberId} onChange={handleInputChange} className={inputBaseClass} />
                        </InputGroup>
                        <InputGroup label="Points">
                            <NumberInput value={data.memberPointsTotal} onChange={v => onChange({...data, memberPointsTotal: v})} />
                        </InputGroup>
                    </div>
                )}
            </Section>

            <Section title={`Items (${data.items.length})`} isOpen={openSections['items']} onToggle={() => toggleSection('items')} isSummary={`${data.items.length} units, Total: ${data.grandTotal}`}>
                <div className="space-y-3">
                    {data.items.map((item, index) => (
                        <div key={item.id} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="flex-1 space-y-2">
                                <input 
                                  className="w-full h-10 px-3 border border-gray-200 rounded-md text-sm text-gray-900 focus:ring-1 focus:ring-black outline-none bg-white" 
                                  value={item.description} 
                                  onChange={(e) => handleItemChange(index, 'description', e.target.value)} 
                                  placeholder="Description"
                                />
                                <div className="flex gap-2">
                                    <div className="w-20">
                                        <NumberInput 
                                            value={item.quantity} 
                                            onChange={(val) => handleItemChange(index, 'quantity', val)}
                                            min={1}
                                            align="center"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <NumberInput 
                                            value={item.unitPrice} 
                                            onChange={(val) => handleItemChange(index, 'unitPrice', val)}
                                            min={0}
                                            prefix="฿"
                                        />
                                    </div>
                                </div>
                            </div>
                            <button
                              onClick={() => removeItem(index)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              aria-label={`Remove item ${index + 1}`}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    <button onClick={addItem} className="w-full py-3 border border-dashed border-gray-200 rounded-lg text-xs font-bold text-gray-400 hover:text-black hover:border-black transition-all">
                        + Add Item
                    </button>
                </div>
            </Section>

            <Section title="Document Details" isOpen={openSections['footer']} onToggle={() => toggleSection('footer')} isSummary={`Total: ${data.grandTotal}`}>
                 {!isLazada && (
                    <InputGroup label="Savings">
                        <NumberInput
                            value={data.savings || 0}
                            onChange={(v) => {
                                const savings = v;
                                const { subtotal, grandTotal, vatAmount } = calculateTotals(data.items, savings, data.vatRate);
                                onChange({ ...data, savings, subtotal, vatAmount, grandTotal });
                            }}
                            prefix="฿"
                            min={0}
                        />
                    </InputGroup>
                 )}
                 
                 <div className="grid grid-cols-2 gap-3">
                     <InputGroup label="Inv No.">
                        <input type="text" name="invoiceNumber" value={data.invoiceNumber} onChange={handleInputChange} className={inputBaseClass} />
                     </InputGroup>
                     <InputGroup label="Date">
                        <input type="date" name="date" value={data.date} onChange={handleInputChange} className={inputBaseClass} />
                     </InputGroup>
                 </div>

                 {isLazada && (
                    <InputGroup label="Ref Order No.">
                        <input type="text" name="refOrderNumber" value={data.refOrderNumber || ''} onChange={handleInputChange} className={inputBaseClass} />
                    </InputGroup>
                 )}

                 {!isLazada && (
                    <InputGroup label="Cash Paid">
                        <NumberInput value={data.cashAmount} onChange={v => onChange({...data, cashAmount: v, changeAmount: v - data.grandTotal})} prefix="฿" />
                    </InputGroup>
                 )}
            </Section>

          </div>
        ) : (
          <div className="pb-24">
             <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
                  <h2 className="text-sm font-bold text-gray-900 mb-4 tracking-tight uppercase">Batch Processing</h2>
                  
                  <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                         {[5, 10, 20].map(count => (
                             <button
                                key={count}
                                onClick={() => setBulkCount(count)}
                                className={`py-2.5 rounded-lg text-[10px] font-bold border transition-all ${bulkCount === count ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                             >
                                {count} RECEIPTS
                             </button>
                         ))}
                      </div>

                     <button 
                        onClick={() => onBulkGenerate(bulkCount, 'current', categoryId)}
                        disabled={isGenerating}
                        className="w-full h-11 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                     >
                        {isGenerating ? <RefreshCw className="animate-spin w-4 h-4" /> : 'Start Batch Generation'}
                     </button>
                  </div>
            </div>

            <div className="flex justify-between items-center mb-4 px-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Queue</span>
                {collection.length > 0 && (
                    <button 
                        type="button"
                        onClick={onClearCollection} 
                        className="text-gray-400 hover:text-black text-[10px] font-bold border-b border-gray-200"
                    >
                        CLEAR ALL
                    </button>
                )}
            </div>

            <div className="space-y-2">
                {collection.length === 0 && (
                    <div className="text-center py-16 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Empty Collection</p>
                    </div>
                )}
                {collection.map((item, idx) => (
                    <div key={idx} className="group bg-white p-3.5 rounded-xl border border-gray-200 flex justify-between items-center transition-all hover:border-black">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="text-[11px] font-bold text-gray-400 w-5 shrink-0">#{idx + 1}</div>
                            <div className="min-w-0">
                                <p className="font-bold text-xs truncate text-gray-900">{item.grandTotal} THB</p>
                                <p className="text-[10px] text-gray-400 truncate uppercase tracking-tighter">
                                    INV {item.invoiceNumber} • {item.templateStyle}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button
                              onClick={() => onLoadFromCollection(idx)}
                              className="p-2 text-gray-400 hover:text-black transition-colors"
                              aria-label={`Load receipt ${idx + 1}`}
                            >
                                <Edit size={14} />
                            </button>
                            <button
                              onClick={() => onRemoveFromCollection(idx)}
                              className="p-2 text-gray-400 hover:text-black transition-colors"
                              aria-label={`Remove receipt ${idx + 1}`}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-white z-20 absolute bottom-0 left-0 right-0">
          {activeTab === 'editor' ? (
              <div className="flex gap-2">
                  <div className="flex-1 flex gap-2">
                    <button 
                        onClick={onDownloadImage} 
                        className="flex-1 h-11 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center"
                    >
                        Save Image
                    </button>
                    <button 
                        onClick={onDownloadPDF} 
                        className="w-12 h-11 border border-gray-200 text-gray-500 rounded-lg flex items-center justify-center hover:bg-gray-50"
                        title="PDF"
                        aria-label="Download PDF"
                    >
                         <FileText size={18} />
                    </button>
                  </div>
                  <button 
                    onClick={onAddToCollection}
                    className="h-11 px-5 border border-black text-black bg-white hover:bg-gray-50 rounded-lg text-xs font-bold"
                  >
                      + Queue
                  </button>
              </div>
          ) : (
             <button 
                onClick={onDownloadZip}
                disabled={collection.length === 0 || processingZip}
                className="w-full h-11 bg-black hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
             >
                {processingZip ? <RefreshCw className="animate-spin w-4 h-4" /> : <Download size={16} />}
                Download ZIP ({collection.length})
             </button>
          )}
      </div>
    </div>
  );
};
