import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AtmosphereBackground } from "@/components/AtmosphereBackground";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Eager: the public landing page is the first paint for every visitor.
// Everything else is code-split so a prospect reading the homepage does not
// download the whole CRM (kanban, charts, admin) before seeing anything.
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Public routes
const Legal = lazy(() => import("./pages/Legal"));
const Auth = lazy(() => import("./pages/Auth"));
const AccessDenied = lazy(() => import("./pages/AccessDenied"));
const BookCall = lazy(() => import("./pages/BookCall"));
const DziriBERTDemo = lazy(() => import("./pages/DziriBERTDemo"));
const GoogleCalendarCallback = lazy(() =>
  import("./pages/GoogleCalendarCallback").then((m) => ({ default: m.GoogleCalendarCallback }))
);

// Admin area
const AdminLayoutWithSidebar = lazy(() =>
  import("@/components/admin/AdminLayoutWithSidebar").then((m) => ({ default: m.AdminLayoutWithSidebar }))
);
const Dashboard = lazy(() =>
  import("@/components/admin/Dashboard").then((m) => ({ default: m.Dashboard }))
);
const ContentEditor = lazy(() =>
  import("@/components/admin/ContentEditor").then((m) => ({ default: m.ContentEditor }))
);
const FormationsManager = lazy(() =>
  import("@/components/admin/FormationsManager").then((m) => ({ default: m.FormationsManager }))
);
const UsersManager = lazy(() =>
  import("@/components/admin/UsersManager").then((m) => ({ default: m.UsersManager }))
);
const ClosersManager = lazy(() =>
  import("@/components/admin/ClosersManager").then((m) => ({ default: m.ClosersManager }))
);
const Analytics = lazy(() =>
  import("@/components/admin/Analytics").then((m) => ({ default: m.Analytics }))
);

// Closer area
const CloserLayout = lazy(() =>
  import("@/components/closer/CloserLayout").then((m) => ({ default: m.CloserLayout }))
);
const DashboardCloser = lazy(() => import("./pages/DashboardCloser"));
const LeadDetail = lazy(() => import("./pages/LeadDetail"));
const SlackSettings = lazy(() => import("./pages/SlackSettings"));
const HubSpotSettings = lazy(() => import("./pages/HubSpotSettings"));
const CloserLeads = lazy(() => import("./pages/CloserLeads"));
const CloserProfile = lazy(() => import("./pages/CloserProfile"));
const CloserSettings = lazy(() => import("./pages/CloserSettings"));
const GoogleCalendarSettings = lazy(() =>
  import("./pages/GoogleCalendarSettings").then((m) => ({ default: m.GoogleCalendarSettings }))
);

const queryClient = new QueryClient();

/**
 * Route-level loading state. Deliberately quiet: TUC's movement is "sobre et net",
 * and a chunk fetch on a decent connection lands well under the 1s threshold where
 * a spinner starts to matter.
 */
const RouteFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
    <span className="sr-only">Chargement…</span>
    <div className="h-8 w-8 animate-spin rounded-full border border-hairline border-t-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Atmosphère de marque — sous tout le contenu, atténuée sur les écrans de travail. */}
          <AtmosphereBackground />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/access-denied" element={<AccessDenied />} />
              <Route path="/reserver-appel" element={<BookCall />} />
              <Route path="/dziribert-demo" element={<DziriBERTDemo />} />
              <Route path="/google-calendar/callback" element={<GoogleCalendarCallback />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminLayoutWithSidebar />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="content" element={<ContentEditor />} />
                <Route path="formations" element={<FormationsManager />} />
                <Route path="users" element={<UsersManager />} />
                <Route path="closers" element={<ClosersManager />} />
                <Route path="analytics" element={<Analytics />} />
              </Route>
              <Route
                path="/dashboard-closer"
                element={
                  <ProtectedRoute requireRole="closer">
                    <CloserLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardCloser />} />
                <Route path="lead/:id" element={<LeadDetail />} />
                <Route path="slack" element={<SlackSettings />} />
                <Route path="hubspot" element={<HubSpotSettings />} />
                <Route path="calendar" element={<GoogleCalendarSettings />} />
                <Route path="leads" element={<CloserLeads />} />
                <Route path="profile" element={<CloserProfile />} />
                <Route path="settings" element={<CloserSettings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
