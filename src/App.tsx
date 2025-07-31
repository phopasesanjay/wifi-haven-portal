import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import ComplaintsPage from "./pages/ComplaintsPage";
import ResidentsPage from "./pages/ResidentsPage";
import NotFound from "./pages/NotFound";
import SpeedTest from "./components/SpeedTest";
import MinimalSpeedTest from "./components/MinimalSpeedTest";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<ComplaintsPage />} />
            <Route path="residents" element={<ResidentsPage />} />
          </Route>

          <Route path="speed-test" element={<SpeedTest />} />
          <Route path="minimal-speed-test" element={<MinimalSpeedTest />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
