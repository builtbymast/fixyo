import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";

const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AppLayout = lazy(() => import("./pages/AppLayout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const JobsList = lazy(() => import("./pages/JobsList"));
const JobDetail = lazy(() => import("./pages/JobDetail"));
const JobForm = lazy(() => import("./pages/JobForm"));
const QuotesList = lazy(() => import("./pages/QuotesList"));
const QuoteDetail = lazy(() => import("./pages/QuoteDetail"));
const QuoteForm = lazy(() => import("./pages/QuoteForm"));
const PublicQuoteView = lazy(() => import("./pages/PublicQuoteView"));
const InvoicesList = lazy(() => import("./pages/InvoicesList"));
const InvoiceDetail = lazy(() => import("./pages/InvoiceDetail"));
const InvoiceForm = lazy(() => import("./pages/InvoiceForm"));
const PublicInvoiceView = lazy(() => import("./pages/PublicInvoiceView"));
const CustomersList = lazy(() => import("./pages/CustomersList"));
const CustomerDetail = lazy(() => import("./pages/CustomerDetail"));
const CustomerForm = lazy(() => import("./pages/CustomerForm"));
const AIGenerator = lazy(() => import("./pages/AIGenerator"));
const SettingsBusiness = lazy(() => import("./pages/SettingsBusiness"));
const SettingsProfile = lazy(() => import("./pages/SettingsProfile"));
const SettingsUserProfile = lazy(() => import("./pages/SettingsUserProfile"));
const SettingsSubscription = lazy(() => import("./pages/SettingsSubscription"));

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
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
              <Router />
            </Suspense>
          </TooltipProvider>
        </SidebarProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
