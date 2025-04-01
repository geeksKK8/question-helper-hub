
import { motion } from 'framer-motion';
import { ThumbsUp, MessageSquare, Clock, User, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import TagBadge from '@/components/ui/TagBadge';
import { Question } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

interface QuestionCardProps {
  question: Question;
  onDeleted?: () => void;
}

const QuestionCard = ({ question, onDeleted }: QuestionCardProps) => {
  const { id, title, content, tags, votes, author_id } = question;
  const [commentCount, setCommentCount] = useState(0);
  const { user } = useAuth();
  
  const isOwnQuestion = user?.id === author_id;
  
  useEffect(() => {
    // Fetch comment count for this question
    const fetchCommentCount = async () => {
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('question_id', id);
      
      if (!error && count !== null) {
        setCommentCount(count);
      }
    };
    
    fetchCommentCount();
  }, [id]);
  
  // Format the date to a readable string
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  // Delete the question
  const handleDelete = async () => {
    if (!user || user.id !== author_id) {
      toast.error("You can only delete your own questions");
      return;
    }

    try {
      // Delete the question from the database
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting question:", error);
        toast.error("Failed to delete question");
        return;
      }

      toast.success("Question deleted successfully");
      
      // Call onDeleted callback if provided
      if (onDeleted) {
        onDeleted();
      }
    } catch (err) {
      console.error("Error in delete operation:", err);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`glass-card p-6 rounded-xl ${isOwnQuestion ? 'border-2 border-blue-400 dark:border-blue-600' : ''}`}
    >
      <div className="flex justify-between items-start">
        <Link to={`/question/${id}`} className="block flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            {title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2">
          {isOwnQuestion && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <User className="h-3 w-3" />
              <span>Mine</span>
            </Badge>
          )}
          
          {isOwnQuestion && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your question
                    and all associated comments.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      
      <Link to={`/question/${id}`} className="block">
        <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-2">
          {content[0]}
        </p>
      </Link>

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map(tag => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <ThumbsUp className="h-4 w-4" />
            <span>{votes}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageSquare className="h-4 w-4" />
            <span>{commentCount}</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4" />
          <span>{formatDate(question.created_at)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionCard;
