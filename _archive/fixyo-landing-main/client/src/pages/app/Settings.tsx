import AppLayout from "@/components/app/AppLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Building2, Check, CreditCard, Save, Sparkles, User, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { format } from "date-fns";

const TRADE_TYPES = ["Plumbing", "Electrical", "Carpentry", "Painting", "Tiling", "Roofing", "HVAC", "Landscaping", "Concreting", "Bricklaying", "General Building"];
const AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-700",
  pro: "bg-amber-100 text-amber-700",
  enterprise: "bg-blue-100 text-blue-700",
};

const PLAN_FEATURES: Record<string, string[]> = {
  free: ["Up to 10 active jobs", "Up to 5 customers", "Basic quotes & invoices", "Email support"],
  pro: ["Unlimited jobs", "Unlimited customers", "PDF generation", "AI job descriptions", "Priority support"],
  enterprise: ["Everything in Pro", "Custom branding", "Dedicated account manager", "SLA guarantee", "API access"],
};

export default function Settings() {
  const { tab } = useParams<{ tab?: string }>();
  const utils = trpc.useUtils();
  const { user, refresh } = useAuth();
  const { data: business } = trpc.business.get.useQuery();
  const { data: subscription } = trpc.subscription.get.useQuery();

  // ── Business state ──────────────────────────────────────────────────────────
  const [biz, setBiz] = useState({
    name: "", tradeType: "", abn: "", phone: "", email: "",
    address: "", city: "", state: "", postcode: "",
    website: "", licenceNumber: "", taxRate: "10",
    invoicePrefix: "INV", quotePrefix: "QT", paymentTerms: 14,
    bankName: "", bsb: "", accountNumber: "", accountName: "",
  });

  useEffect(() => {
    if (business) {
      setBiz({
        name: business.name ?? "",
        tradeType: business.tradeType ?? "",
        abn: business.abn ?? "",
        phone: business.phone ?? "",
        email: business.email ?? "",
        address: business.address ?? "",
        city: business.city ?? "",
        state: business.state ?? "",
        postcode: business.postcode ?? "",
        website: business.website ?? "",
        licenceNumber: business.licenceNumber ?? "",
        taxRate: business.taxRate ?? "10",
        invoicePrefix: business.invoicePrefix ?? "INV",
        quotePrefix: business.quotePrefix ?? "QT",
        paymentTerms: business.paymentTerms ?? 14,
        bankName: business.bankName ?? "",
        bsb: business.bsb ?? "",
        accountNumber: business.accountNumber ?? "",
        accountName: business.accountName ?? "",
      });
    }
  }, [business]);

  const saveBiz = trpc.business.upsert.useMutation({
    onSuccess: () => { toast.success("Settings saved!"); utils.business.get.invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  const handleBizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveBiz.mutate(biz);
  };

  // ── Profile state ───────────────────────────────────────────────────────────
  const [profileName, setProfileName] = useState("");
  useEffect(() => { if (user?.name) setProfileName(user.name); }, [user?.name]);

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated!");
      refresh();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const activeTab = tab && ["business", "billing", "profile", "subscription"].includes(tab) ? tab : "business";

  return (
    <AppLayout title="Settings">
      <Tabs value={activeTab} onValueChange={(v) => window.history.replaceState(null, "", `/app/settings/${v}`)}>
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="business" className="gap-1.5"><Building2 className="w-3.5 h-3.5" />Business</TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5"><CreditCard className="w-3.5 h-3.5" />Billing & Payments</TabsTrigger>
          <TabsTrigger value="profile" className="gap-1.5"><User className="w-3.5 h-3.5" />Profile</TabsTrigger>
          <TabsTrigger value="subscription" className="gap-1.5"><Sparkles className="w-3.5 h-3.5" />Subscription</TabsTrigger>
        </TabsList>

        {/* ── Business tab ─────────────────────────────────────────────────── */}
        <form onSubmit={handleBizSubmit}>
          <TabsContent value="business">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-base text-[#1B2B4B]">Business Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Business Name *</Label><Input value={biz.name} onChange={e => setBiz(b => ({ ...b, name: e.target.value }))} placeholder="Your business name" required className="mt-1" /></div>
                  <div>
                    <Label>Trade Type</Label>
                    <Select value={biz.tradeType} onValueChange={v => setBiz(b => ({ ...b, tradeType: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select trade" /></SelectTrigger>
                      <SelectContent>{TRADE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>ABN</Label><Input value={biz.abn} onChange={e => setBiz(b => ({ ...b, abn: e.target.value }))} placeholder="12 345 678 901" className="mt-1" /></div>
                  <div><Label>Licence Number</Label><Input value={biz.licenceNumber} onChange={e => setBiz(b => ({ ...b, licenceNumber: e.target.value }))} placeholder="Your trade licence number" className="mt-1" /></div>
                  <div><Label>Phone</Label><Input value={biz.phone} onChange={e => setBiz(b => ({ ...b, phone: e.target.value }))} placeholder="0400 000 000" className="mt-1" /></div>
                  <div><Label>Email</Label><Input type="email" value={biz.email} onChange={e => setBiz(b => ({ ...b, email: e.target.value }))} placeholder="you@business.com.au" className="mt-1" /></div>
                  <div><Label>Website</Label><Input value={biz.website} onChange={e => setBiz(b => ({ ...b, website: e.target.value }))} placeholder="https://yourbusiness.com.au" className="mt-1" /></div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="border-0 shadow-sm">
                  <CardHeader><CardTitle className="text-base text-[#1B2B4B]">Address</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div><Label>Street Address</Label><Input value={biz.address} onChange={e => setBiz(b => ({ ...b, address: e.target.value }))} placeholder="123 Main St" className="mt-1" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>City/Suburb</Label><Input value={biz.city} onChange={e => setBiz(b => ({ ...b, city: e.target.value }))} placeholder="Sydney" className="mt-1" /></div>
                      <div>
                        <Label>State</Label>
                        <Select value={biz.state} onValueChange={v => setBiz(b => ({ ...b, state: v }))}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="State" /></SelectTrigger>
                          <SelectContent>{AU_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div><Label>Postcode</Label><Input value={biz.postcode} onChange={e => setBiz(b => ({ ...b, postcode: e.target.value }))} placeholder="2000" className="mt-1" /></div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader><CardTitle className="text-base text-[#1B2B4B]">Document Defaults</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div><Label>GST Rate (%)</Label><Input type="number" value={biz.taxRate} onChange={e => setBiz(b => ({ ...b, taxRate: e.target.value }))} className="mt-1" /></div>
                    <div><Label>Payment Terms (days)</Label><Input type="number" value={biz.paymentTerms} onChange={e => setBiz(b => ({ ...b, paymentTerms: parseInt(e.target.value) || 14 }))} className="mt-1" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Invoice Prefix</Label><Input value={biz.invoicePrefix} onChange={e => setBiz(b => ({ ...b, invoicePrefix: e.target.value }))} placeholder="INV" className="mt-1" /></div>
                      <div><Label>Quote Prefix</Label><Input value={biz.quotePrefix} onChange={e => setBiz(b => ({ ...b, quotePrefix: e.target.value }))} placeholder="QT" className="mt-1" /></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-6">
              <Button type="submit" disabled={saveBiz.isPending} className="bg-[#1B2B4B] hover:bg-[#243a63] text-white gap-2">
                <Save className="w-4 h-4" /> {saveBiz.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </TabsContent>

          {/* ── Billing tab ───────────────────────────────────────────────── */}
          <TabsContent value="billing">
            <div className="max-w-lg">
              <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-base text-[#1B2B4B]">Bank Account Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-500">These details will appear on your invoices to help customers pay you directly.</p>
                  <div><Label>Bank Name</Label><Input value={biz.bankName} onChange={e => setBiz(b => ({ ...b, bankName: e.target.value }))} placeholder="Commonwealth Bank" className="mt-1" /></div>
                  <div><Label>Account Name</Label><Input value={biz.accountName} onChange={e => setBiz(b => ({ ...b, accountName: e.target.value }))} placeholder="Your Business Pty Ltd" className="mt-1" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>BSB</Label><Input value={biz.bsb} onChange={e => setBiz(b => ({ ...b, bsb: e.target.value }))} placeholder="062-000" className="mt-1" /></div>
                    <div><Label>Account Number</Label><Input value={biz.accountNumber} onChange={e => setBiz(b => ({ ...b, accountNumber: e.target.value }))} placeholder="12345678" className="mt-1" /></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Button type="submit" disabled={saveBiz.isPending} className="bg-[#1B2B4B] hover:bg-[#243a63] text-white gap-2">
                <Save className="w-4 h-4" /> {saveBiz.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </TabsContent>
        </form>

        {/* ── Profile tab ──────────────────────────────────────────────────── */}
        <TabsContent value="profile">
          <div className="max-w-lg space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-base text-[#1B2B4B]">Your Profile</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {profileName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div>
                    <p className="font-medium text-[#1B2B4B]">{profileName || "Your Name"}</p>
                    <p className="text-sm text-gray-400">{user?.email ?? "No email"}</p>
                    {user?.loginMethod && (
                      <p className="text-xs text-gray-400 mt-0.5 capitalize">Signed in via {user.loginMethod}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <div>
                    <Label>Display Name</Label>
                    <Input
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      placeholder="Your full name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={user?.email ?? ""} disabled className="mt-1 bg-gray-50 text-gray-400" />
                    <p className="text-xs text-gray-400 mt-1">Email is managed by your sign-in provider and cannot be changed here.</p>
                  </div>
                </div>

                <Button
                  onClick={() => updateProfile.mutate({ name: profileName })}
                  disabled={updateProfile.isPending || !profileName.trim()}
                  className="w-full bg-[#1B2B4B] hover:bg-[#243a63] text-white gap-2"
                >
                  <Save className="w-4 h-4" /> {updateProfile.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Subscription tab ─────────────────────────────────────────────── */}
        <TabsContent value="subscription">
          <div className="space-y-6 max-w-3xl">
            {/* Current plan */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-base text-[#1B2B4B]">Current Plan</CardTitle>
                  <Badge className={`capitalize ${PLAN_COLORS[subscription?.plan ?? "free"]}`}>
                    {subscription?.plan ?? "Free"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Plan</p>
                    <p className="font-semibold text-[#1B2B4B] capitalize">{subscription?.plan ?? "Free"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Status</p>
                    <p className="font-semibold text-[#1B2B4B] capitalize">{subscription?.status ?? "Active"}</p>
                  </div>
                  {subscription?.currentPeriodEnd && (
                    <div>
                      <p className="text-gray-400">Renews</p>
                      <p className="font-semibold text-[#1B2B4B]">{format(new Date(subscription.currentPeriodEnd), "dd MMM yyyy")}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Included in your plan</p>
                  <ul className="space-y-1.5">
                    {(PLAN_FEATURES[subscription?.plan ?? "free"] ?? PLAN_FEATURES.free).map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade CTA — only shown if not on enterprise */}
            {(subscription?.plan ?? "free") !== "enterprise" && (
              <div className="grid sm:grid-cols-2 gap-4">
                {(subscription?.plan ?? "free") === "free" && (
                  <Card className="border-2 border-amber-400 shadow-sm bg-amber-50/40">
                    <CardHeader>
                      <CardTitle className="text-base text-[#1B2B4B] flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" /> Pro Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-2xl font-bold text-[#1B2B4B] font-['Sora']">$29<span className="text-base font-normal text-gray-400">/mo</span></p>
                      <ul className="space-y-1.5">
                        {PLAN_FEATURES.pro.map(f => (
                          <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-amber-500 flex-shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                        Upgrade to Pro
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base text-[#1B2B4B] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500" /> Enterprise
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-2xl font-bold text-[#1B2B4B] font-['Sora']">Custom</p>
                    <ul className="space-y-1.5">
                      {PLAN_FEATURES.enterprise.map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-blue-500 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="w-full border-[#1B2B4B] text-[#1B2B4B]">
                      Contact Sales
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
