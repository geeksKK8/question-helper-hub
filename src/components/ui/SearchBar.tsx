
import { useState } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (results: any[]) => void;
  className?: string;
}

const SearchBar = ({ 
  placeholder = "Search for questions...", 
  onSearch,
  className
}: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);

    try {
      // Call semantic search edge function
      const response = await supabase.functions.invoke('semantic-search', {
        body: JSON.stringify({ query: searchTerm, type: 'search' })
      });

      const similarQuestions = response.data || [];

      if (onSearch) {
        onSearch(similarQuestions);
      }
    } catch (error) {
      console.error('Semantic search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className={`relative ${className}`}
    >
      <div 
        className={`relative flex items-center transition-all duration-300 ${
          isFocused ? 'ring-2 ring-gray-400 dark:ring-gray-500' : ''
        }`}
      >
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="pr-10 rounded-full glass-card focus-visible:ring-0 focus-visible:ring-offset-0 border-none bg-white/10 dark:bg-black/10"
        />
        <button 
          type="submit"
          disabled={isSearching}
          className="absolute right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
        >
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </button>
      </div>
      <AnimatePresence>
        {isFocused && searchTerm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-10 mt-2 w-full rounded-lg bg-white dark:bg-gray-800 shadow-lg overflow-hidden glass-card"
          >
            <div className="p-2 text-sm text-gray-500 dark:text-gray-400">
              {isSearching ? 'Searching...' : 'Type more to see suggestions...'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
};

export default SearchBar;
