import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Briefing from "./pages/Briefing";
import Signals from "./pages/Signals";
import Opportunities from "./pages/Opportunities";
import Patterns from "./pages/Patterns";
import Prospect from "./pages/Prospect";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import FindCover from "./pages/FindCover";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/briefing" element={<ProtectedRoute><Briefing /></ProtectedRoute>} />
          <Route path="/signals" element={<ProtectedRoute><Signals /></ProtectedRoute>} />
          <Route path="/opportunities" element={<ProtectedRoute><Opportunities /></ProtectedRoute>} />
          <Route path="/patterns" element={<ProtectedRoute><Patterns /></ProtectedRoute>} />
          <Route path="/prospect" element={<ProtectedRoute><Prospect /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/find-cover" element={<ProtectedRoute><FindCover /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/briefing" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
