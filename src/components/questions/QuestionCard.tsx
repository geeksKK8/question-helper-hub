
import { motion } from 'framer-motion';
import { ThumbsUp, MessageSquare, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import TagBadge from '@/components/ui/TagBadge';
import { Question } from '@/lib/types';

interface QuestionCardProps {
  question: Question;
}

const QuestionCard = ({ question }: QuestionCardProps) => {
  const { id, title, content, tags, votes } = question;
  
  // Format the date to a readable string
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="glass-card p-6 rounded-xl"
    >
      <Link to={`/question/${id}`} className="block">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-2">
          {content}
        </p>
      </Link>

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map(tag => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            <ThumbsUp className="h-4 w-4" />
            <span>{votes}</span>
          </button>
          <button className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            <MessageSquare className="h-4 w-4" />
            <span>12</span>
          </button>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4" />
          <span>{formatDate(question.createdAt)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionCard;
