import AppLayout from "@/components/app/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Bot, Copy, FileText, Lightbulb, Sparkles } from "lucide-react";
import { useState } from "react";

const TRADE_TYPES = ["Plumbing", "Electrical", "Carpentry", "Painting", "Tiling", "Roofing", "HVAC", "Landscaping", "Concreting", "Bricklaying", "General Building"];

export default function AIGenerator() {
  const { data: business } = trpc.business.get.useQuery();
  const [tradeType, setTradeType] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState("");
  const [lineItems, setLineItems] = useState<any[]>([]);

  const genDesc = trpc.ai.generateJobDescription.useMutation({
    onSuccess: (data) => { setResult(data.text); toast.success("Description generated!"); },
    onError: (e: any) => toast.error(e.message),
  });
  const genQuote = trpc.ai.generateQuoteText.useMutation({
    onSuccess: (data) => { setResult(data.text); toast.success("Quote text generated!"); },
    onError: (e: any) => toast.error(e.message),
  });
  const genItems = trpc.ai.generateLineItems.useMutation({
    onSuccess: (data) => { setLineItems(data.items); toast.success("Line items generated!"); },
    onError: (e: any) => toast.error(e.message),
  });
  const genEmail = trpc.ai.generateFollowUpEmail.useMutation({
    onSuccess: (data) => { setResult(data.text); toast.success("Email generated!"); },
    onError: (e: any) => toast.error(e.message),
  });

  const trade = tradeType || business?.tradeType || "trade";
  const isPending = genDesc.isPending || genQuote.isPending || genItems.isPending || genEmail.isPending;

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard!");
  };

  return (
    <AppLayout title="AI Generator">
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Bot className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="font-semibold text-[#1B2B4B]">AI Prompt Generator</h2>
            <p className="text-sm text-gray-500">Generate professional trade content with AI</p>
          </div>
        </div>

        <div className="grid gap-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Trade Type</Label>
              <Select value={tradeType} onValueChange={setTradeType}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={business?.tradeType ?? "Select trade"} /></SelectTrigger>
                <SelectContent>
                  {TRADE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Job Title</Label>
              <Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Bathroom renovation" className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Job Description (optional context)</Label>
            <Textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} placeholder="Any extra context about the job..." rows={2} className="mt-1" />
          </div>
        </div>

        <Tabs defaultValue="description">
          <TabsList className="mb-4">
            <TabsTrigger value="description" className="gap-1.5"><FileText className="w-3.5 h-3.5" />Job Description</TabsTrigger>
            <TabsTrigger value="quote" className="gap-1.5"><Sparkles className="w-3.5 h-3.5" />Quote Text</TabsTrigger>
            <TabsTrigger value="items" className="gap-1.5"><Lightbulb className="w-3.5 h-3.5" />Line Items</TabsTrigger>
            <TabsTrigger value="email" className="gap-1.5"><Bot className="w-3.5 h-3.5" />Follow-up Email</TabsTrigger>
          </TabsList>

          <TabsContent value="description">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base text-[#1B2B4B]">Job Description</CardTitle>
                <Button onClick={() => genDesc.mutate({ tradeType: trade, jobTitle: jobTitle || "general job", context: jobDesc || undefined })} disabled={isPending} className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                  <Bot className="w-4 h-4" /> {genDesc.isPending ? "Generating..." : "Generate"}
                </Button>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div>
                    <Textarea value={result} onChange={e => setResult(e.target.value)} rows={8} className="font-mono text-sm" />
                    <Button variant="outline" size="sm" onClick={copyResult} className="mt-2 gap-1"><Copy className="w-3 h-3" />Copy</Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Bot className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Fill in the job details above and click Generate</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quote">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base text-[#1B2B4B]">Quote Introduction Text</CardTitle>
                <Button onClick={() => genQuote.mutate({ tradeType: trade, jobTitle: jobTitle || "general job", lineItemsSummary: jobDesc })} disabled={isPending} className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                  <Bot className="w-4 h-4" /> {genQuote.isPending ? "Generating..." : "Generate"}
                </Button>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div>
                    <Textarea value={result} onChange={e => setResult(e.target.value)} rows={8} className="font-mono text-sm" />
                    <Button variant="outline" size="sm" onClick={copyResult} className="mt-2 gap-1"><Copy className="w-3 h-3" />Copy</Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Generate professional quote introduction text</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="items">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base text-[#1B2B4B]">Suggested Line Items</CardTitle>
                <Button onClick={() => genItems.mutate({ tradeType: trade, jobDescription: jobTitle || jobDesc || "general job" })} disabled={isPending} className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                  <Bot className="w-4 h-4" /> {genItems.isPending ? "Generating..." : "Generate"}
                </Button>
              </CardHeader>
              <CardContent>
                {lineItems.length > 0 ? (
                  <div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-gray-100"><th className="text-left py-2 text-gray-400 font-medium">Description</th><th className="text-right py-2 text-gray-400 font-medium">Qty</th><th className="text-right py-2 text-gray-400 font-medium">Unit</th><th className="text-right py-2 text-gray-400 font-medium">Est. Price</th></tr></thead>
                        <tbody>
                          {lineItems.map((item, i) => (
                            <tr key={i} className="border-b border-gray-50">
                              <td className="py-2 text-[#1B2B4B]">{item.description}</td>
                              <td className="py-2 text-right text-gray-600">{item.quantity}</td>
                              <td className="py-2 text-right text-gray-600">{item.unit}</td>
                              <td className="py-2 text-right font-medium text-[#1B2B4B]">${parseFloat(String(item.unitPrice)).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(lineItems.map(i => `${i.description} x${i.quantity} @ $${i.unitPrice}`).join("\n")); toast.success("Copied!"); }} className="mt-2 gap-1"><Copy className="w-3 h-3" />Copy as Text</Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Lightbulb className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Get AI-suggested line items for your trade job</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base text-[#1B2B4B]">Follow-up Email</CardTitle>
                <Button onClick={() => genEmail.mutate({ tradeType: trade, jobTitle: jobTitle || "general job", customerName: "Customer" })} disabled={isPending} className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                  <Bot className="w-4 h-4" /> {genEmail.isPending ? "Generating..." : "Generate"}
                </Button>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div>
                    <Textarea value={result} onChange={e => setResult(e.target.value)} rows={10} className="font-mono text-sm" />
                    <Button variant="outline" size="sm" onClick={copyResult} className="mt-2 gap-1"><Copy className="w-3 h-3" />Copy</Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Bot className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Generate a professional follow-up email for your customer</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
