import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const QuestionnaireByToken = lazy(() => import("./pages/QuestionnaireByToken"));
const Admin = lazy(() => import("./pages/Admin"));

const queryClient = new QueryClient();

const App = () => {
  if (typeof window !== "undefined" && (window.location.pathname === "/admin" || window.location.pathname === "/admin/")) {
    const target = `${window.location.origin}/#/admin-panel`;
    if (window.location.href !== target) {
      window.location.replace(target);
      return null;
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">טוען...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/q/:token" element={<QuestionnaireByToken />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin-panel" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
