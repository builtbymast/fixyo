import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-[#FAFAF7]">
          <div className="flex flex-col items-center w-full max-w-md text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-6">
              <AlertTriangle size={32} className="text-amber-600" />
            </div>
            <h2 className="font-['Sora'] font-bold text-2xl text-[#1B2B4B] mb-3">
              Something went wrong
            </h2>
            <p className="text-[#64748B] text-sm leading-relaxed mb-6">
              We hit an unexpected error. Please reload the page — if the problem persists, contact{" "}
              <a href="mailto:support@fixyo.ai" className="text-amber-600 hover:underline">
                support@fixyo.ai
              </a>
              .
            </p>
            {/* Only show stack trace in development */}
            {isDev && this.state.error?.stack && (
              <div className="w-full p-4 rounded-xl bg-slate-100 overflow-auto mb-6 text-left">
                <pre className="text-xs text-slate-500 whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl",
                "bg-[#1B2B4B] text-white font-semibold text-sm",
                "hover:bg-[#243a63] transition-colors cursor-pointer"
              )}
            >
              <RotateCcw size={15} />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
