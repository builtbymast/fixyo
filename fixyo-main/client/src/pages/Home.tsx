import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && user && !loading) {
      navigate("/app/dashboard");
    }
  }, [isAuthenticated, user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">FixYo</div>
          <Button asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-primary">
              Job Management for Australian Tradespeople
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Quote faster, invoice smarter, get paid on time. The all-in-one platform built for tradies.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <a href={getLoginUrl()}>Get Started</a>
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-semibold text-lg mb-2">Job Management</h3>
              <p className="text-sm text-muted-foreground">
                Track jobs from scheduling to completion with photos and notes
              </p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-semibold text-lg mb-2">Smart Quoting</h3>
              <p className="text-sm text-muted-foreground">
                Create professional quotes with automatic calculations and customer signing
              </p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-semibold text-lg mb-2">Online Payments</h3>
              <p className="text-sm text-muted-foreground">
                Accept payments online with Stripe integration and automatic invoice tracking
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 FixYo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
