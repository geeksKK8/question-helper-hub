
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Question, Comment } from '@/lib/types';
import QuestionDetail from '@/components/questions/QuestionDetail';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const QuestionView = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchQuestion = async () => {
      setLoading(true);
      try {
        if (!questionId) {
          setError('Question ID is missing');
          setLoading(false);
          return;
        }

        // Fetch the question
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .select('*')
          .eq('id', questionId)
          .single();
        
        if (questionError) {
          console.error('Error fetching question:', questionError);
          setError('Error fetching question');
          setLoading(false);
          return;
        }

        if (!questionData) {
          setError('Question not found');
          setLoading(false);
          return;
        }

        setQuestion(questionData as Question);
        
        // Fetch comments for the question
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select('*')
          .eq('question_id', questionId)
          .order('created_at', { ascending: false });
        
        if (commentsError) {
          console.error('Error fetching comments:', commentsError);
          toast.error('Failed to load comments');
        } else {
          setComments(commentsData as Comment[]);
        }
      } catch (err) {
        console.error('Error in fetch question:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestion();
  }, [questionId]);

  // Function to add a new comment
  const handleAddComment = async (content: string) => {
    if (!user) {
      toast.error('You must be logged in to comment');
      return;
    }

    if (!questionId || !content.trim()) return;

    try {
      const newComment = {
        question_id: questionId,
        content,
        author_id: user.id
      };

      const { data, error } = await supabase
        .from('comments')
        .insert(newComment)
        .select()
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        toast.error('Failed to add comment');
        return;
      }

      // Add the new comment to the state
      setComments([data as Comment, ...comments]);
      toast.success('Comment added');
    } catch (err) {
      console.error('Error in add comment:', err);
      toast.error('An unexpected error occurred');
    }
  };

  // Function to update votes
  const handleVote = async (type: 'up' | 'down') => {
    if (!user) {
      toast.error('You must be logged in to vote');
      return;
    }

    if (!question) return;

    const voteChange = type === 'up' ? 1 : -1;
    
    try {
      const { error } = await supabase
        .from('questions')
        .update({ 
          votes: question.votes + voteChange 
        })
        .eq('id', question.id);

      if (error) {
        console.error('Error updating votes:', error);
        toast.error('Failed to update vote');
        return;
      }

      // Update local state
      setQuestion({
        ...question,
        votes: question.votes + voteChange
      });

      toast.success(type === 'up' ? 'Upvoted successfully' : 'Downvoted successfully');
    } catch (err) {
      console.error('Error in vote:', err);
      toast.error('An unexpected error occurred');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="glass-card p-8 rounded-xl animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 flex items-center justify-center">
        <div className="glass-card p-8 rounded-xl text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The question you're looking for does not exist or has been removed.
          </p>
          <a
            href="/browse"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Questions
          </a>
        </div>
      </div>
    );
  }
  
  if (!question) {
    return null; // Should never happen given the error state above
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24">
      <QuestionDetail 
        question={question} 
        comments={comments} 
        onAddComment={handleAddComment}
        onVote={handleVote}
      />
    </div>
  );
};

export default QuestionView;
