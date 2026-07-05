import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Download } from "lucide-react";

interface SignatureCaptureProps {
  onSignatureCapture: (signatureData: string) => void;
  disabled?: boolean;
}

export default function SignatureCapture({
  onSignatureCapture,
  disabled = false,
}: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1e3a5f"; // Deep Navy
    ctx.stroke();

    setIsEmpty(false);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;

    const signatureData = canvas.toDataURL("image/png");
    onSignatureCapture(signatureData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Signature</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Please sign below to accept this quote. Draw your signature in the box.
          </p>

          <canvas
            ref={canvasRef}
            width={500}
            height={150}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="border-2 border-border rounded-lg bg-white cursor-crosshair w-full"
            style={{ touchAction: "none" }}
          />

          <p className="text-xs text-muted-foreground">
            Click and drag to sign. Use your mouse or touchpad.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearSignature}
            disabled={isEmpty || disabled}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Clear
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={saveSignature}
            disabled={isEmpty || disabled}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            Confirm Signature
          </Button>
        </div>

        {!isEmpty && (
          <div className="p-3 bg-accent/10 rounded-lg">
            <p className="text-sm font-medium text-accent">
              ✓ Signature captured. Click "Confirm Signature" to proceed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
