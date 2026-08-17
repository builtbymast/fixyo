import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Copy, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type PromptType = "job_description" | "quote_text" | "invoice_notes" | "follow_up_email";

const PROMPT_TYPES: { value: PromptType; label: string; placeholder: string }[] = [
  {
    value: "job_description",
    label: "Job Description",
    placeholder:
      "e.g. Replace leaking kitchen tap, customer says water pooling under sink, likely worn washer",
  },
  {
    value: "quote_text",
    label: "Quote Text",
    placeholder:
      "e.g. Full bathroom retile, 12sqm, supply and install, removal of old tiles included",
  },
  {
    value: "invoice_notes",
    label: "Invoice Notes",
    placeholder:
      "e.g. Job completed 3 days early, customer supplied their own fittings, 30-day payment terms",
  },
  {
    value: "follow_up_email",
    label: "Follow-up Email",
    placeholder: "e.g. Following up on unpaid invoice #INV-004, due 5 days ago, polite reminder",
  },
];

export default function AIGenerator() {
  const [, setLocation] = useLocation();
  const [promptType, setPromptType] = useState<PromptType>("job_description");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState("");

  const generateMutation = trpc.ai.generate.useMutation();
  const { data: history = [], refetch: refetchHistory } = trpc.ai.history.useQuery();

  const activeType = PROMPT_TYPES.find((t) => t.value === promptType)!;

  const handleGenerate = async () => {
    if (!notes.trim()) {
      toast.error("Please describe what you need first");
      return;
    }
    try {
      const response = await generateMutation.mutateAsync({ promptType, notes: notes.trim() });
      setResult(response.output);
      refetchHistory();
    } catch (error) {
      console.error("AI generate error:", error);
      toast.error("Failed to generate. Please try again.");
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/app/dashboard")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Generator</h1>
          <p className="text-muted-foreground">
            Turn quick notes into polished, customer-ready text
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Content</CardTitle>
          <CardDescription>Pick what you need, jot down the details, and let AI draft it</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Content Type</label>
            <Select value={promptType} onValueChange={(v) => setPromptType(v as PromptType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROMPT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Your Notes</label>
            <Textarea
              placeholder={activeType.placeholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <Button onClick={handleGenerate} disabled={generateMutation.isPending} className="gap-2">
            {generateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate
          </Button>

          {result && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Result</label>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
              <div className="rounded-md border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                {result}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Generations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.slice(0, 10).map((log) => (
                <div key={log.id} className="p-3 border rounded-md space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {PROMPT_TYPES.find((t) => t.value === log.promptType)?.label ?? log.promptType}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{log.output}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
