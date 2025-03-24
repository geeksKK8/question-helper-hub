
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TagBadgeProps {
  tag: string;
  count?: number;
  onClick?: () => void;
  className?: string;
  active?: boolean;
}

const TagBadge = ({ tag, count, onClick, className, active = false }: TagBadgeProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-all",
        active 
          ? "bg-gray-800 text-white dark:bg-white dark:text-gray-800" 
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700",
        className
      )}
    >
      {tag}
      {count !== undefined && (
        <span className={cn(
          "ml-2 rounded-full px-1.5 py-0.5 text-xs font-semibold",
          active 
            ? "bg-white text-gray-800 dark:bg-gray-800 dark:text-white" 
            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
        )}>
          {count}
        </span>
      )}
    </motion.button>
  );
};

export default TagBadge;
