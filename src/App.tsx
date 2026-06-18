import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { ClassProvider } from "@/contexts/ClassContext";
import { SectionHelperProvider } from "@/contexts/SectionHelperContext";
import Index from "./pages/Index";
import EmpathyMap from "./pages/EmpathyMap";
import Converge from "./pages/Converge";
import UserPersona from "./pages/UserPersona";
import JTBD from "./pages/JTBD";
import JourneyMap from "./pages/JourneyMap";
import PointOfView from "./pages/PointOfView";
import HowMightWe from "./pages/HowMightWe";
import FiveWhys from "./pages/FiveWhys";
import Ideation from "./pages/Ideation";
import AssumptionSelection from "./pages/AssumptionSelection";
import EffortImpact from "./pages/EffortImpact";
import Storyboard from "./pages/Storyboard";
import PrototypeBrief from "./pages/PrototypeBrief";
import UserTesting from "./pages/UserTesting";
import PrdGenerator from "./pages/PrdGenerator";
import Admin from "./pages/Admin";
import JoinClass from "./pages/JoinClass";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ClassProvider>
        <AdminProvider>
        <ProjectProvider>
        <SectionHelperProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/empathy-map" element={<EmpathyMap />} />
            <Route path="/converge" element={<Converge />} />
            <Route path="/user-persona" element={<UserPersona />} />
            <Route path="/jtbd" element={<JTBD />} />
            <Route path="/journey-map" element={<JourneyMap />} />
            <Route path="/pov" element={<PointOfView />} />
            <Route path="/hmw" element={<HowMightWe />} />
            <Route path="/five-whys" element={<FiveWhys />} />
            <Route path="/ideation" element={<Ideation />} />
            <Route path="/effort-impact" element={<EffortImpact />} />
            <Route path="/assumptions" element={<AssumptionSelection />} />
            <Route path="/storyboard" element={<Storyboard />} />
            <Route path="/prototype-brief" element={<PrototypeBrief />} />
            <Route path="/user-testing" element={<UserTesting />} />
            <Route path="/prd" element={<PrdGenerator />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/join/:classId" element={<JoinClass />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SectionHelperProvider>
        </ProjectProvider>
        </AdminProvider>
        </ClassProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
