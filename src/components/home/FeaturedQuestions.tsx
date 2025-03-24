
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionCard from '@/components/questions/QuestionCard';
import { Question, Tag } from '@/lib/types';
import TagBadge from '@/components/ui/TagBadge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Available filter categories
const categories = [
  { id: 'trending', name: 'Trending' },
  { id: 'recent', name: 'Recent' },
  { id: 'most-voted', name: 'Most Voted' },
];

const FeaturedQuestions = () => {
  const [activeCategory, setActiveCategory] = useState('trending');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [popularTags, setPopularTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        let query = supabase.from('questions').select('*');
        
        if (activeCategory === 'recent') {
          query = query.order('created_at', { ascending: false });
        } else if (activeCategory === 'most-voted') {
          query = query.order('votes', { ascending: false });
        } else {
          // For trending, we might combine recency and votes in a real app
          // For now, let's use votes as a proxy for trending
          query = query.order('votes', { ascending: false });
        }
        
        // Limit to 3 questions for the featured section
        query = query.limit(3);
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching questions:', error);
          toast.error('Failed to load featured questions');
        } else {
          setQuestions(data as Question[]);
          
          // Get all questions to extract popular tags
          const { data: allQuestionsData } = await supabase
            .from('questions')
            .select('tags');
          
          if (allQuestionsData) {
            // Extract and count all tags
            const tagCounts: Record<string, number> = {};
            allQuestionsData.forEach(q => {
              q.tags.forEach((tag: string) => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
              });
            });
            
            // Convert to array and sort by count
            const sortedTags = Object.entries(tagCounts)
              .map(([name, count]) => ({ id: name, name, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5); // Get top 5 tags
              
            setPopularTags(sortedTags);
          }
        }
      } catch (err) {
        console.error('Error in fetchFeaturedQuestions:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [activeCategory]);
  
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Featured Questions
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore our community's most interesting questions and answers, or contribute your own insights.
          </p>
        </div>

        <div className="mt-10 flex justify-center space-x-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full transition-all ${
                activeCategory === category.id
                  ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-1 lg:grid-cols-3 md:grid-cols-2">
          <AnimatePresence mode="wait">
            {loading ? (
              // Loading skeletons
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-card p-6 rounded-xl animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    <div className="mt-4 flex space-x-2">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              questions.map((question) => (
                <motion.div
                  key={question.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <QuestionCard question={question} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
        
        <div className="mt-12 text-center">
          {popularTags.map((tag) => (
            <TagBadge key={tag.id} tag={tag.name} count={tag.count} className="m-1" />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedQuestions;
