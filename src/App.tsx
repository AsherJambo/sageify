import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

const Index = lazy(() => import("./pages/Index"));
const GoldenCanvas = lazy(() => import("./pages/GoldenCanvas"));
const Haredi = lazy(() => import("./pages/Haredi"));
const Cocktail = lazy(() => import("./pages/Cocktail"));
const PreviewHolland = lazy(() => import("./pages/PreviewHolland"));
const PreviewVIA = lazy(() => import("./pages/PreviewVIA"));
const PreviewSchein = lazy(() => import("./pages/PreviewSchein"));
const PreviewMotivation = lazy(() => import("./pages/PreviewMotivation"));

const QuestionnaireByToken = lazy(() => import("./pages/QuestionnaireByToken"));
const Admin = lazy(() => import("./pages/Admin"));
const EmployerAdmin = lazy(() => import("./pages/EmployerAdmin"));
const PartnerQuestionnaire = lazy(() => import("./pages/PartnerQuestionnaire"));

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
              <Route path="/" element={<Landing />} />
              <Route path="/app" element={<Index />} />
              <Route path="/golden-canvas" element={<GoldenCanvas />} />
              <Route path="/haredi" element={<Haredi />} />
              <Route path="/cocktail" element={<Cocktail />} />
              <Route path="/preview/holland" element={<PreviewHolland />} />
              <Route path="/preview/via" element={<PreviewVIA />} />
              <Route path="/preview/schein" element={<PreviewSchein />} />
              <Route path="/preview/motivation" element={<PreviewMotivation />} />
              <Route path="/q/:token" element={<QuestionnaireByToken />} />
              <Route path="/partner/:partnerId/q/:token" element={<PartnerQuestionnaire />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin-panel" element={<Admin />} />
              <Route path="/employer-admin" element={<EmployerAdmin />} />
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
