
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MessageSquare, Share, Flag, Edit } from 'lucide-react';
import TagBadge from '@/components/ui/TagBadge';
import { Question, Comment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface QuestionDetailProps {
  question: Question;
  comments: Comment[];
}

const QuestionDetail = ({ question, comments }: QuestionDetailProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnswer, setEditedAnswer] = useState(question.answer);
  const [newComment, setNewComment] = useState('');
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  const handleVote = (type: 'up' | 'down') => {
    if (voted === type) {
      setVoted(null);
      toast.success("Vote removed");
    } else {
      setVoted(type);
      toast.success(type === 'up' ? "Upvoted successfully" : "Downvoted successfully");
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

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: `temp-${Date.now()}`,
      questionId: question.id,
      content: newComment,
      createdAt: new Date(),
      author: 'You', // In a real app, this would be the logged-in user
    };
    
    setLocalComments([...localComments, comment]);
    setNewComment('');
    toast.success('Comment added');
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
          <span>Posted by {question.author} on {formatDate(question.createdAt)}</span>
        </div>
        
        <div className="mt-6 prose dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300">{question.content}</p>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {question.tags.map(tag => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-8 rounded-xl mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Answer</h2>
        
        {isEditing ? (
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
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300">{question.answer}</p>
          </div>
        )}
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => handleVote('up')}
              className={`flex items-center space-x-1 p-1 rounded-md ${
                voted === 'up' 
                  ? 'bg-gray-100 text-green-600 dark:bg-gray-800 dark:text-green-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
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
            >
              <ThumbsDown className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-1 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Edit className="h-5 w-5" />
              <span className="hidden sm:inline">Edit</span>
            </button>
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
          Comments ({localComments.length})
        </h2>
        
        <div className="mt-6 space-y-6">
          <AnimatePresence>
            {localComments.map((comment) => (
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
                      {comment.author}
                    </h3>
                    <time className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(comment.createdAt)}
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
          />
          <Button 
            onClick={handleAddComment}
            className="mt-4"
            disabled={!newComment.trim()}
          >
            Post Comment
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuestionDetail;
