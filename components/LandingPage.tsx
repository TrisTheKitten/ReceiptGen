import React from 'react';
import { ArrowRight, Sparkles, Download, Layers, Zap, Shield } from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export function LandingPage({ onEnterApp }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#F9F8F6] overflow-x-hidden">
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      
      <section className="relative pt-20 sm:pt-24 md:pt-32 lg:pt-40 pb-16 sm:pb-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-[#6C6863] text-xs uppercase tracking-[0.3em] mb-6">
                AI-Powered Generation
              </p>
              <h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-[#1A1A1A] leading-[0.9] mb-6 sm:mb-8"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Create
                <br />
                <span className="italic">Realistic</span>
                <br />
                Receipts
              </h1>
              <p className="text-[#6C6863] text-sm sm:text-base lg:text-lg leading-relaxed max-w-md mb-8 sm:mb-10">
                Generate authentic 7-Eleven and Lazada receipts with AI. 
                Perfect for testing, prototyping, or creative projects.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onEnterApp}
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1A1A1A] text-[#F9F8F6] text-xs font-medium uppercase tracking-[0.2em] hover:bg-[#2a2a2a] transition-all duration-500 shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
                >
                  Start Creating
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>

            <div className="order-1 lg:order-2 relative">
              <div className="relative aspect-[4/5] max-w-[280px] sm:max-w-sm md:max-w-md mx-auto lg:max-w-none">
                <div className="absolute inset-0 bg-[#EBE5DE] transform rotate-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)]" />
                <div className="absolute inset-0 bg-[#1A1A1A] transform -rotate-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                  <div className="absolute inset-4 border border-[#F9F8F6]/10" />
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <img src="/example.png" alt="Example Receipt" className="w-full h-full object-contain transform rotate-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 lg:py-32 border-t border-[#1A1A1A]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-10 sm:mb-16 lg:mb-24">
            <p className="text-[#6C6863] text-xs uppercase tracking-[0.3em] mb-6">
              Capabilities
            </p>
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] leading-[0.95]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Everything You Need
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
            <FeatureCard
              icon={<Sparkles size={20} />}
              title="AI Generation"
              description="Powered by Google Gemini. Generate realistic receipt data with a single click."
            />
            <FeatureCard
              icon={<Layers size={20} />}
              title="Multiple Templates"
              description="7-Eleven thermal receipts and Lazada order receipts with authentic styling."
            />
            <FeatureCard
              icon={<Download size={20} />}
              title="Flexible Export"
              description="Download as PNG, PDF, or batch export multiple receipts as ZIP."
            />
            <FeatureCard
              icon={<Zap size={20} />}
              title="Batch Generation"
              description="Generate up to 20 unique receipts at once for large-scale testing."
            />
            <FeatureCard
              icon={<Shield size={20} />}
              title="Scanner Effects"
              description="Apply realistic scan effects including noise, rotation, and paper texture."
            />
            <FeatureCard
              icon={<ArrowRight size={20} />}
              title="Full Customization"
              description="Edit every field manually. Complete control over all receipt details."
            />
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-[#1A1A1A] text-[#F9F8F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-[#EBE5DE]/60 text-xs uppercase tracking-[0.3em] mb-4 sm:mb-6">
                How It Works
              </p>
              <h2 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl leading-[0.95] mb-6 sm:mb-8"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Three Simple
                <br />
                <span className="italic">Steps</span>
              </h2>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <StepItem 
                number="01" 
                title="Enter API Key" 
                description="Get your free Gemini API key from Google AI Studio" 
              />
              <StepItem 
                number="02" 
                title="Choose Template" 
                description="Select 7-Eleven or Lazada receipt format" 
              />
              <StepItem 
                number="03" 
                title="Generate & Export" 
                description="Click Generate AI and download your receipt" 
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 lg:py-32 border-t border-[#1A1A1A]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 lg:gap-16 text-center">
            <StatItem value="2" label="Receipt Templates" />
            <StatItem value="20" label="Batch Generation Limit" />
            <StatItem value="3" label="Export Formats" />
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-[#EBE5DE]/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl text-[#1A1A1A] leading-[0.95] mb-6 sm:mb-8"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Ready to <span className="italic">Create</span>?
          </h2>
          <p className="text-[#6C6863] text-sm sm:text-base lg:text-lg leading-relaxed mb-8 sm:mb-10 max-w-xl mx-auto">
            Start generating professional receipts in seconds. 
            No signup required. Just your Gemini API key.
            All data is stored locally on your device.
          </p>
          <button
            onClick={onEnterApp}
            className="group inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-[#1A1A1A] text-[#F9F8F6] text-xs font-medium uppercase tracking-[0.2em] hover:bg-[#2a2a2a] transition-all duration-500 shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
          >
            Launch Application
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </section>

      </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group p-4 sm:p-6 lg:p-8 border border-[#1A1A1A]/10 hover:border-[#1A1A1A]/20 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-500">
      <div className="w-8 h-8 sm:w-10 sm:h-10 border border-[#1A1A1A]/20 flex items-center justify-center text-[#1A1A1A] mb-4 sm:mb-6 group-hover:bg-[#1A1A1A] group-hover:text-[#F9F8F6] transition-all duration-500">
        {icon}
      </div>
      <h3 className="text-[#1A1A1A] font-medium text-base sm:text-lg mb-2 sm:mb-3">{title}</h3>
      <p className="text-[#6C6863] text-xs sm:text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StepItem({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-4 sm:gap-6 items-start">
      <span className="text-[#D4AF37] text-xs font-medium tracking-wider">{number}</span>
      <div>
        <h3 className="text-[#F9F8F6] font-medium text-base sm:text-lg mb-1 sm:mb-2">{title}</h3>
        <p className="text-[#EBE5DE]/60 text-xs sm:text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p 
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] mb-2 sm:mb-3"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {value}
      </p>
      <p className="text-[#6C6863] text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em]">{label}</p>
    </div>
  );
}
