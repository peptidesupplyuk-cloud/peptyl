import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PipFloatingButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Only show on authenticated dashboard-area pages, hide on /pip itself
  const dashPaths = ["/dashboard", "/dna", "/compound", "/improve"];
  const show = user && dashPaths.some((p) => location.pathname.startsWith(p)) && location.pathname !== "/pip";

  if (!show) return null;

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
      onClick={() => navigate("/pip")}
      className="fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform md:bottom-6"
      aria-label="Chat with Pip"
    >
      <Sparkles className="h-6 w-6" />
      {/* Subtle pulse ring */}
      <span className="absolute inset-0 rounded-full animate-ping bg-primary/20 pointer-events-none" style={{ animationDuration: "3s" }} />
    </motion.button>
  );
};

export default PipFloatingButton;
