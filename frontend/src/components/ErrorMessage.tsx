import { motion } from "framer-motion";

const ErrorMessage = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="flex items-center justify-center gap-3 py-2 text-red-600 bg-red-50 rounded-xl mb-4"
  >
    <span className="text-xs font-bold tracking-wide uppercase">{message}</span>
  </motion.div>
);

export default ErrorMessage;
