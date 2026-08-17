import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SettingsNav from "@/components/SettingsNav";

export default function SettingsSubscription() {
  return (
    <div className="space-y-6">
      <SettingsNav />
      <div>
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-muted-foreground mt-1">Manage your plan and billing</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Billing & Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Subscription management is coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
