import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  message: string;
  duration?: number; // Time in ms, default 3000
}

const AutoDismissError = ({ message, duration = 3000 }: Props) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <AnimatePresence>
      {visible && message && (
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
      )}
    </AnimatePresence>
  );
};

export default AutoDismissError;
