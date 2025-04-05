import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import SearchBar from '@/components/ui/SearchBar';
import QuestionCard from '@/components/questions/QuestionCard';
import { Question } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

const Browse = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyMine, setOnlyMine] = useState(false);
  const { user } = useAuth();

  // Existing fetch function
  const fetchQuestions = async (searchResults?: Question[]) => {
    setLoading(true);
    try {
      if (searchResults) {
        // If we have semantic search results, use those
        setQuestions(searchResults);
      } else {
        // Standard query fetching
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setQuestions(data || []);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchResults: Question[]) => {
    fetchQuestions(searchResults);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Filter questions if "Only Mine" is selected
  const filteredQuestions = onlyMine && user
    ? questions.filter(q => q.author_id === user.id)
    : questions;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <SearchBar 
          placeholder="Search questions semantically..." 
          onSearch={handleSearch}
          className="w-full md:w-2/3"
        />
        {user && (
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="onlyMine" 
              checked={onlyMine}
              onChange={() => setOnlyMine(!onlyMine)}
              className="form-checkbox"
            />
            <label htmlFor="onlyMine" className="text-sm">
              Show Only My Questions
            </label>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">Loading questions...</div>
      ) : filteredQuestions.length === 0 ? (
        <div className="text-center py-8">No questions found.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuestions.map(question => (
            <QuestionCard 
              key={question.id} 
              question={question} 
              onDeleted={() => fetchQuestions()}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Browse;
