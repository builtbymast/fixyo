/* FixYo 404 Page — Warm Modernism */
import { Wrench } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center p-8 text-center">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-12">
        <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center">
          <Wrench className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-['Sora'] text-2xl" style={{ fontWeight: 800 }}>
          <span className="text-[#1B2B4B]">Fix</span>
          <span className="text-amber-500">Yo</span>
        </span>
      </div>

      {/* 404 */}
      <div className="font-['Sora'] font-extrabold text-[120px] leading-none text-[#1B2B4B]/8 select-none mb-0">
        404
      </div>

      <h1 className="font-['Sora'] font-extrabold text-3xl text-[#1B2B4B] -mt-4 mb-3">
        Page Not Found
      </h1>
      <p className="text-[#64748B] text-base leading-relaxed max-w-sm mb-8">
        This page doesn't exist or has been moved. Head back to the homepage to get back on track.
      </p>

      <button
        onClick={() => setLocation("/")}
        className="inline-flex items-center gap-2 bg-[#1B2B4B] hover:bg-[#243a63] text-white font-semibold px-7 py-3 rounded-xl transition-colors shadow-lg shadow-[#1B2B4B]/20"
      >
        ← Back to Home
      </button>
    </div>
  );
}
