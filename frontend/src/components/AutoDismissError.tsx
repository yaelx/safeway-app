import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface Props {
  message: string;
  onDismiss: () => void;
  duration?: number; // Time in ms, default 3000
}

const AutoDismissError = ({ message, onDismiss, duration = 3000 }: Props) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer); // Cleanup if component unmounts early
  }, [duration, onDismiss]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="flex items-center justify-center gap-3 py-2 text-red-600 bg-red-50 rounded-xl mb-4"
      >
        <span className="text-xs font-bold tracking-wide uppercase">
          {message}
        </span>
      </motion.div>
    </AnimatePresence>
  );
};

export default AutoDismissError;
