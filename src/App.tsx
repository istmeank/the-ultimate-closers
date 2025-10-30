import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LanguageProvider } from "@/contexts/LanguageContext";

import { CloserLayout } from "@/components/closer/CloserLayout";
import Index from "./pages/Index";
import Legal from "./pages/Legal";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import BookCall from "./pages/BookCall";
import DashboardCloser from "./pages/DashboardCloser";
import CalendarSettings from "./pages/CalendarSettings";
import SlackSettings from "./pages/SlackSettings";
import CloserLeads from "./pages/CloserLeads";
import CloserProfile from "./pages/CloserProfile";
import CloserSettings from "./pages/CloserSettings";
import AccessDenied from "./pages/AccessDenied";
import NotFound from "./pages/NotFound";

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
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard-closer" 
              element={
                <ProtectedRoute requireRole="closer">
                  <CloserLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardCloser />} />
              <Route path="calendar" element={<CalendarSettings />} />
              <Route path="slack" element={<SlackSettings />} />
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
