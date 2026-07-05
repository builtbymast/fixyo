import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import AppLayout from "./pages/AppLayout";
import Dashboard from "./pages/Dashboard";
import JobsList from "./pages/JobsList";
import JobDetail from "./pages/JobDetail";
import JobForm from "./pages/JobForm";
import QuotesList from "./pages/QuotesList";
import QuoteDetail from "./pages/QuoteDetail";
import QuoteForm from "./pages/QuoteForm";
import PublicQuoteView from "./pages/PublicQuoteView";
import InvoicesList from "./pages/InvoicesList";
import InvoiceDetail from "./pages/InvoiceDetail";
import InvoiceForm from "./pages/InvoiceForm";
import PublicInvoiceView from "./pages/PublicInvoiceView";
import CustomersList from "./pages/CustomersList";
import CustomerDetail from "./pages/CustomerDetail";
import CustomerForm from "./pages/CustomerForm";
import AIGenerator from "./pages/AIGenerator";
import SettingsBusiness from "./pages/SettingsBusiness";
import SettingsProfile from "./pages/SettingsProfile";
import SettingsUserProfile from "./pages/SettingsUserProfile";
import SettingsSubscription from "./pages/SettingsSubscription";
import { useAuth } from "./_core/hooks/useAuth";

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Switch>
      {/* Public Routes */}
      <Route path={"/"} component={Home} />
      <Route path={"/portal/quote/:token"} component={PublicQuoteView} />
      <Route path={"/portal/invoice/:token"} component={PublicInvoiceView} />

      {/* App Routes - Protected by checking user */}
      {user ? (
        <>
          {/* Dashboard */}
          <Route path={"/app/dashboard"}>
            {() => (
              <AppLayout>
                <Dashboard />
              </AppLayout>
            )}
          </Route>

          {/* Jobs */}
          <Route path={"/app/jobs"}>
            {() => (
              <AppLayout>
                <JobsList />
              </AppLayout>
            )}
          </Route>
          <Route path={"/app/jobs/new"}>
            {() => (
              <AppLayout>
                <JobForm />
              </AppLayout>
            )}
          </Route>
          <Route path={"/app/jobs/:id"}>
            {() => (
              <AppLayout>
                <JobDetail />
              </AppLayout>
            )}
          </Route>
          <Route path={"/app/jobs/:id/edit"}>
            {() => (
              <AppLayout>
                <JobForm />
              </AppLayout>
            )}
          </Route>

          {/* Quotes */}
          <Route path={"/app/quotes"}>
            {() => (
              <AppLayout>
                <QuotesList />
              </AppLayout>
            )}
          </Route>
          <Route path={"/app/quotes/new"}>
            {() => (
              <AppLayout>
                <QuoteForm />
              </AppLayout>
            )}
          </Route>
          <Route path={"/app/quotes/:id"}>
            {() => (
              <AppLayout>
                <QuoteDetail />
              </AppLayout>
            )}
          </Route>
          <Route path={"/app/quotes/:id/edit"}>
            {() => (
              <AppLayout>
                <QuoteForm />
              </AppLayout>
            )}
          </Route>

          {/* Invoices */}
          <Route path={"/app/invoices"}>
            {() => (
              <AppLayout>
                <InvoicesList />
              </AppLayout>
            )}
          </Route>
          <Route path={"/app/invoices/new"}>
            {() => (
              <AppLayout>
                <InvoiceForm />
              </AppLayout>
            )}
          </Route>
          <Route path={"/app/invoices/:id"}>
            {() => (
              <AppLayout>
                <InvoiceDetail />
              </AppLayout>
            )}
          </Route>
          <Route path={"/app/invoices/:id/edit"}>
            {() => (
              <AppLayout>
                <InvoiceForm />
              </AppLayout>
            )}
          </Route>

          {/* Customers */}
          <Route path={"/app/customers"}>
            {() => (
              <AppLayout>
                <CustomersList />
              </AppLayout>
            )}
          </Route>
          <Route path={"/app/customers/new"}>
            {() => (
              <AppLayout>
                <CustomerForm />
              </AppLayout>
            )}
          </Route>
          <Route path={"/app/customers/:id"}>
            {() => (
              <AppLayout>
                <CustomerDetail />
              </AppLayout>
            )}
          </Route>
          <Route path={"/app/customers/:id/edit"}>
            {() => (
              <AppLayout>
                <CustomerForm />
              </AppLayout>
            )}
          </Route>

          {/* AI */}
          <Route path={"/app/ai"}>
            {() => (
              <AppLayout>
                <AIGenerator />
              </AppLayout>
            )}
          </Route>

          {/* Settings */}
          <Route path={"/app/settings/business"}>
            {() => (
              <AppLayout>
                <SettingsBusiness />
              </AppLayout>
            )}
          </Route>
          <Route path={"/app/settings/profile"}>
            {() => (
              <AppLayout>
                <SettingsProfile />
              </AppLayout>
            )}
          </Route>
          <Route path={"/app/settings/user"}>
            {() => (
              <AppLayout>
                <SettingsUserProfile />
              </AppLayout>
            )}
          </Route>
          <Route path={"/app/settings/subscription"}>
            {() => (
              <AppLayout>
                <SettingsSubscription />
              </AppLayout>
            )}
          </Route>
        </>
      ) : null}

      {/* 404 */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <SidebarProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </SidebarProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
