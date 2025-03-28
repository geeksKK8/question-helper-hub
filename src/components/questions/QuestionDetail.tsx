
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MessageSquare, Share, Flag, Edit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TagBadge from '@/components/ui/TagBadge';
import { Question, Comment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface QuestionDetailProps {
  question: Question;
  comments: Comment[];
  onAddComment: (content: string) => Promise<void>;
  onVote: (type: 'up' | 'down') => Promise<void>;
}

const QuestionDetail = ({ question, comments, onAddComment, onVote }: QuestionDetailProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnswer, setEditedAnswer] = useState(question.answer[0] || '');
  const [newComment, setNewComment] = useState('');
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);
  const { user } = useAuth();
  
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const handleVote = async (type: 'up' | 'down') => {
    if (voted === type) {
      setVoted(null);
    } else {
      setVoted(type);
      await onVote(type);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  const handleSaveEdit = () => {
    // Here you would typically make an API call to update the answer
    setIsEditing(false);
    toast.success('Answer updated successfully');
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    if (!user) {
      toast.error('You must be logged in to comment');
      return;
    }
    
    await onAddComment(newComment);
    setNewComment('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Create pairs of questions and answers
  const questionAnswerPairs = question.content.map((content, index) => {
    return { 
      question: content, 
      answer: question.answer[index] || "No answer provided for this question."
    };
  });

  // Markdown rendering component with proper styling
  const MarkdownContent = ({ content }: { content: string }) => (
    <div className="prose dark:prose-invert max-w-none prose-pre:bg-gray-800 prose-pre:text-white prose-pre:p-4 prose-pre:rounded-md prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-lg prose-img:mx-auto">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" />
          ),
          code: ({ node, inline, ...props }) => (
            inline 
              ? <code {...props} className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm" />
              : <code {...props} className="block p-4 rounded bg-gray-100 dark:bg-gray-800 text-sm overflow-x-auto" />
          ),
          pre: ({ node, ...props }) => (
            <pre {...props} className="p-4 rounded bg-gray-100 dark:bg-gray-800 overflow-x-auto" />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto">
              <table {...props} className="border-collapse border border-gray-300 dark:border-gray-700" />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th {...props} className="border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-800" />
          ),
          td: ({ node, ...props }) => (
            <td {...props} className="border border-gray-300 dark:border-gray-700 px-4 py-2" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8"
    >
      <motion.div variants={itemVariants} className="glass-card p-8 rounded-xl mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{question.title}</h1>
        
        <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <span>Posted on {formatDate(question.created_at)}</span>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {question.tags.map(tag => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      </motion.div>

      {/* Question-Answer pairs */}
      {questionAnswerPairs.map((pair, index) => (
        <motion.div 
          key={index}
          variants={itemVariants} 
          className="glass-card p-8 rounded-xl mb-8"
        >
          <div className="mb-8 border-b pb-6 border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Question {index + 1}</h2>
            <MarkdownContent content={pair.question} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Answer</h2>
            
            {isEditing && index === 0 ? (
              <div className="mt-4">
                <Textarea 
                  value={editedAnswer}
                  onChange={(e) => setEditedAnswer(e.target.value)}
                  className="min-h-[200px]"
                  placeholder="Edit the answer..."
                />
                <div className="mt-4 flex space-x-2">
                  <Button onClick={handleSaveEdit}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <MarkdownContent content={pair.answer} />
            )}
          </div>
        </motion.div>
      ))}

      <motion.div variants={itemVariants} className="glass-card p-8 rounded-xl mb-8">        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => handleVote('up')}
              className={`flex items-center space-x-1 p-1 rounded-md ${
                voted === 'up' 
                  ? 'bg-gray-100 text-green-600 dark:bg-gray-800 dark:text-green-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              disabled={!user}
            >
              <ThumbsUp className="h-5 w-5" />
              <span>{voted === 'up' ? question.votes + 1 : question.votes}</span>
            </button>
            <button 
              onClick={() => handleVote('down')}
              className={`flex items-center space-x-1 p-1 rounded-md ${
                voted === 'down' 
                  ? 'bg-gray-100 text-red-600 dark:bg-gray-800 dark:text-red-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              disabled={!user}
            >
              <ThumbsDown className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            {user && (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-1 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Edit className="h-5 w-5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}
            <button 
              onClick={handleShare}
              className="flex items-center space-x-1 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Share className="h-5 w-5" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button className="flex items-center space-x-1 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
              <Flag className="h-5 w-5" />
              <span className="hidden sm:inline">Report</span>
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-8 rounded-xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Comments ({comments.length})
        </h2>
        
        <div className="mt-6 space-y-6">
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div 
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {comment.author_id.substring(0, 8)}
                    </h3>
                    <time className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(comment.created_at)}
                    </time>
                  </div>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    {comment.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Add a comment
          </h3>
          <Textarea 
            placeholder="Write your comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
            disabled={!user}
          />
          <Button 
            onClick={handleAddComment}
            className="mt-4"
            disabled={!newComment.trim() || !user}
          >
            {user ? 'Post Comment' : 'Log in to comment'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuestionDetail;
