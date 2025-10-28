import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Legal from "./pages/Legal";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import BookCall from "./pages/BookCall";
import DashboardCloser from "./pages/DashboardCloser";
import LeadDetail from "./pages/LeadDetail";
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
                  <DashboardCloser />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard-closer/lead/:id" 
              element={
                <ProtectedRoute requireRole="closer">
                  <LeadDetail />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
