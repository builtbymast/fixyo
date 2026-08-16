import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Landing pages
import Home from "./pages/Home";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

// App pages (authenticated)
import AppDashboard from "./pages/app/Dashboard";
import JobsList from "./pages/app/JobsList";
import JobDetail from "./pages/app/JobDetail";
import JobForm from "./pages/app/JobForm";
import QuotesList from "./pages/app/QuotesList";
import QuoteDetail from "./pages/app/QuoteDetail";
import QuoteForm from "./pages/app/QuoteForm";
import InvoicesList from "./pages/app/InvoicesList";
import InvoiceDetail from "./pages/app/InvoiceDetail";
import InvoiceForm from "./pages/app/InvoiceForm";
import CustomersList from "./pages/app/CustomersList";
import CustomerDetail from "./pages/app/CustomerDetail";
import AIGenerator from "./pages/app/AIGenerator";
import Settings from "./pages/app/Settings";
import QuotePrint from "./pages/app/QuotePrint";
import InvoicePrint from "./pages/app/InvoicePrint";

// Public portal pages (no auth)
import QuotePortal from "./pages/portal/QuotePortal";
import InvoicePortal from "./pages/portal/InvoicePortal";

function Router() {
  return (
    <Switch>
      {/* Landing */}
      <Route path="/" component={Home} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />

      {/* App (authenticated) */}
      <Route path="/app" component={AppDashboard} />
      <Route path="/app/dashboard" component={AppDashboard} />
      <Route path="/app/jobs" component={JobsList} />
      <Route path="/app/jobs/new" component={JobForm} />
      <Route path="/app/jobs/:id/edit" component={JobForm} />
      <Route path="/app/jobs/:id" component={JobDetail} />
      <Route path="/app/quotes" component={QuotesList} />
      <Route path="/app/quotes/new" component={QuoteForm} />
      <Route path="/app/quotes/:id/edit" component={QuoteForm} />
      <Route path="/app/quotes/:id" component={QuoteDetail} />
      <Route path="/app/invoices" component={InvoicesList} />
      <Route path="/app/invoices/new" component={InvoiceForm} />
      <Route path="/app/invoices/:id/edit" component={InvoiceForm} />
      <Route path="/app/invoices/:id" component={InvoiceDetail} />
      <Route path="/app/customers" component={CustomersList} />
      <Route path="/app/customers/:id" component={CustomerDetail} />
      <Route path="/app/ai" component={AIGenerator} />
      <Route path="/app/settings" component={Settings} />
      <Route path="/app/settings/:tab" component={Settings} />
      <Route path="/app/quotes/:id/print" component={QuotePrint} />
      <Route path="/app/invoices/:id/print" component={InvoicePrint} />

      {/* Public portal */}
      <Route path="/portal/quote/:token" component={QuotePortal} />
      <Route path="/portal/invoice/:token" component={InvoicePortal} />

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
