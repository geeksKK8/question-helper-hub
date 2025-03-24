
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AnimatedTransition from "./components/ui/AnimatedTransition";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import Submit from "./pages/Submit";
import QuestionView from "./pages/QuestionView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <div className="min-h-screen pt-16">
          <AnimatedTransition>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/submit" element={<Submit />} />
              <Route path="/question/:questionId" element={<QuestionView />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatedTransition>
        </div>
        <Footer />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
