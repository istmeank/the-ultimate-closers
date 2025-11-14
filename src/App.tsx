import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LanguageProvider } from "@/contexts/LanguageContext";

import { CloserLayout } from "@/components/closer/CloserLayout";
import { AdminLayoutWithSidebar } from "@/components/admin/AdminLayoutWithSidebar";
import Index from "./pages/Index";
import Legal from "./pages/Legal";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import BookCall from "./pages/BookCall";
import DashboardCloser from "./pages/DashboardCloser";
import LeadDetail from "./pages/LeadDetail";
import SlackSettings from "./pages/SlackSettings";
import HubSpotSettings from "./pages/HubSpotSettings";
import CloserLeads from "./pages/CloserLeads";
import CloserProfile from "./pages/CloserProfile";
import CloserSettings from "./pages/CloserSettings";
import AccessDenied from "./pages/AccessDenied";
import DziriBERTDemo from "./pages/DziriBERTDemo";
import NotFound from "./pages/NotFound";
import { GoogleCalendarSettings } from "./pages/GoogleCalendarSettings";
import { GoogleCalendarCallback } from "./pages/GoogleCalendarCallback";
import { Dashboard } from "@/components/admin/Dashboard";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { FormationsManager } from "@/components/admin/FormationsManager";
import { UsersManager } from "@/components/admin/UsersManager";
import { ClosersManager } from "@/components/admin/ClosersManager";
import { Analytics } from "@/components/admin/Analytics";

const queryClient = new QueryClient();



const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
