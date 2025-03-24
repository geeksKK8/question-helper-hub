
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter } from 'lucide-react';
import QuestionCard from '@/components/questions/QuestionCard';
import TagBadge from '@/components/ui/TagBadge';
import SearchBar from '@/components/ui/SearchBar';
import { Button } from '@/components/ui/button';
import { Question, Tag } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Sorting options
const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'votes', label: 'Most Votes' },
];

const Browse = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recent');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        let query = supabase.from('questions').select('*');
        
        if (sortBy === 'recent') {
          query = query.order('created_at', { ascending: false });
        } else if (sortBy === 'votes') {
          query = query.order('votes', { ascending: false });
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching questions:', error);
          toast.error('Failed to load questions');
        } else {
          setQuestions(data as Question[]);
          
          // Extract all tags for the filter
          const allTags = data.flatMap(q => q.tags);
          const uniqueTags = [...new Set(allTags)];
          
          // Create tag objects with counts
          const tagsWithCounts = uniqueTags.map(tag => {
            const count = data.filter(q => q.tags.includes(tag)).length;
            return {
              id: tag,
              name: tag,
              count
            };
          });
          
          // Sort by count
          tagsWithCounts.sort((a, b) => b.count - a.count);
          
          setTags(tagsWithCounts);
        }
      } catch (err) {
        console.error('Error in fetchQuestions:', err);
        toast.error('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [sortBy]);
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(tag => tag !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };
  
  // Filter questions based on search term and selected tags
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = searchTerm === '' || 
      question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => question.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Browse Questions
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Explore questions and AI-generated answers from the community
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar / Filters - Hidden on mobile unless expanded */}
          <AnimatePresence>
            {(isFilterOpen || window.innerWidth >= 768) && (
              <motion.aside 
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                className={`w-full md:w-64 glass-card p-6 rounded-xl ${
                  isFilterOpen ? 'fixed inset-0 z-50 h-full overflow-auto md:static md:h-auto' : 'hidden md:block'
                }`}
              >
                {isFilterOpen && (
                  <div className="md:hidden flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Filters</h2>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsFilterOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                )}
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Sort By</h3>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Popular Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.slice(0, 10).map(tag => (
                        <TagBadge 
                          key={tag.id}
                          tag={tag.name}
                          count={tag.count}
                          active={selectedTags.includes(tag.name)}
                          onClick={() => toggleTag(tag.name)}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {selectedTags.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Selected Tags</h3>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedTags([])}
                        >
                          Clear All
                        </Button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedTags.map(tag => (
                          <TagBadge 
                            key={tag}
                            tag={tag}
                            active={true}
                            onClick={() => toggleTag(tag)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
          
          {/* Main content */}
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <SearchBar 
                onSearch={handleSearch} 
                className="w-full sm:max-w-md"
              />
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setIsFilterOpen(true)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredQuestions.length} results
                </span>
              </div>
            </div>
            
            {loading ? (
              <div className="space-y-6">
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
              </div>
            ) : filteredQuestions.length > 0 ? (
              <div className="grid gap-6">
                <AnimatePresence>
                  {filteredQuestions.map(question => (
                    <motion.div
                      key={question.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <QuestionCard question={question} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-12 glass-card">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                  No questions found
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Try adjusting your search or filters
                </p>
                {selectedTags.length > 0 && (
                  <Button 
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSelectedTags([])}
                  >
                    Clear Tag Filters
                  </Button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Browse;
