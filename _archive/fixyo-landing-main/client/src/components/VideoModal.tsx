/* FixYo VideoModal — Warm Modernism
 * Full-screen lightbox modal for demo video
 * Supports YouTube / Vimeo embed URLs
 * Closes on Escape key, backdrop click, or close button
 */
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface VideoModalProps {
  open: boolean;
  onClose: () => void;
  /** Full YouTube embed URL, e.g. https://www.youtube.com/embed/VIDEO_ID?autoplay=1
   *  or Vimeo: https://player.vimeo.com/video/VIDEO_ID?autoplay=1
   *  Leave as the placeholder URL until a real video is ready.
   */
  embedUrl?: string;
}

const PLACEHOLDER_EMBED =
  "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1";

export default function VideoModal({
  open,
  onClose,
  embedUrl = PLACEHOLDER_EMBED,
}: VideoModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  /* Lock body scroll while open */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
      style={{ background: "rgba(10, 18, 35, 0.88)" }}
    >
      {/* Backdrop blur layer */}
      <div className="absolute inset-0 backdrop-blur-sm" />

      {/* Modal container */}
      <div
        className="relative z-10 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
        style={{
          animation: "modalIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between bg-[#1B2B4B] px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center">
              <svg viewBox="0 0 16 16" fill="white" className="w-3 h-3">
                <path d="M6 3.5L12 8l-6 4.5V3.5z" />
              </svg>
            </div>
            <span
              className="font-['Sora'] font-semibold text-sm text-white"
            >
              FixYo — Product Demo
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close video"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 16:9 iframe wrapper */}
        <div className="relative w-full bg-black" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={embedUrl}
            title="FixYo Product Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>

        {/* Bottom bar */}
        <div className="bg-[#1B2B4B]/95 px-5 py-3 flex items-center justify-between">
          <p className="text-white/50 text-xs">
            See how FixYo helps Australian tradies quote, invoice, and get paid faster.
          </p>
          <button
            onClick={onClose}
            className="text-amber-400 hover:text-amber-300 text-xs font-semibold transition-colors"
          >
            Close ×
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
