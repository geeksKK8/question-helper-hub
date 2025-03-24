import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter } from 'lucide-react';
import QuestionCard from '@/components/questions/QuestionCard';
import TagBadge from '@/components/ui/TagBadge';
import SearchBar from '@/components/ui/SearchBar';
import { Button } from '@/components/ui/button';
import { Question } from '@/lib/types';

// Sample data for questions
const sampleQuestions: Question[] = [
  {
    id: '1',
    title: 'How does reinforcement learning differ from supervised learning?',
    content: 'I\'m trying to understand the key differences between reinforcement learning and supervised learning approaches in AI.',
    answer: 'Supervised learning uses labeled data to teach models to make predictions, while reinforcement learning involves an agent learning to make decisions by taking actions in an environment to maximize rewards. Unlike supervised learning which has immediate feedback through labeled examples, reinforcement learning relies on delayed rewards and exploration of the environment. Supervised learning is used for classification and regression problems, while reinforcement learning is ideal for sequential decision-making tasks like game playing, robotics, and autonomous systems.',
    tags: ['machine-learning', 'reinforcement-learning', 'ai-theory'],
    createdAt: new Date('2023-10-22'),
    updatedAt: new Date('2023-10-22'),
    votes: 42,
    author: 'user1'
  },
  {
    id: '2',
    title: 'Explaining quantum computing to a software developer',
    content: 'As a traditional software developer, I\'m struggling to grasp quantum computing concepts. Can someone explain it in terms I might understand?',
    answer: 'Quantum computing leverages quantum mechanics principles to process information in ways classical computers cannot. While classical computers use bits (0 or 1), quantum computers use qubits that can exist in multiple states simultaneously through superposition. This allows quantum computers to evaluate many possibilities at once. Another key concept is entanglement, where qubits become correlated so that the state of one instantly affects another, regardless of distance. For a software developer, think of it as extreme parallelism where instead of sequential operations or limited parallel threads, quantum algorithms can explore exponentially many paths simultaneously. This makes quantum computers potentially much faster for specific problems like factoring large numbers, search, and optimization.',
    tags: ['quantum-computing', 'computer-science', 'beginners'],
    createdAt: new Date('2023-10-15'),
    updatedAt: new Date('2023-10-17'),
    votes: 38,
    author: 'user2'
  },
  {
    id: '3',
    title: 'Ethical considerations in developing AI systems',
    content: 'What are the main ethical considerations that developers should keep in mind when building AI systems?',
    answer: 'When developing AI systems, key ethical considerations include: 1) Bias and fairness - ensuring AI doesn\'t perpetuate or amplify existing societal biases; 2) Transparency and explainability - making sure decisions can be understood and explained; 3) Privacy - protecting personal data used to train and operate AI; 4) Accountability - establishing clear responsibility for AI actions; 5) Safety and security - preventing harmful outcomes or misuse; 6) Human autonomy - ensuring AI augments rather than replaces human decision-making in critical areas; 7) Social impact - considering effects on employment and society; and 8) Sustainability - accounting for environmental impacts of computing resources. Developers should implement ethics by design, conduct impact assessments, engage diverse stakeholders, and establish governance structures that continuously monitor systems.',
    tags: ['ethics', 'ai-ethics', 'responsible-ai'],
    createdAt: new Date('2023-10-12'),
    updatedAt: new Date('2023-10-14'),
    votes: 65,
    author: 'user3'
  },
  {
    id: '4',
    title: 'Best practices for fine-tuning large language models',
    content: 'I want to fine-tune a large language model for a specific domain. What are the current best practices to achieve good results while keeping costs reasonable?',
    answer: 'When fine-tuning large language models, consider these best practices: 1) Curate high-quality training data that\'s representative of your target domain and task; 2) Use parameter-efficient fine-tuning methods like LoRA, QLoRA, or adapter-based approaches to reduce computational costs; 3) Implement early stopping and evaluate on a validation set to prevent overfitting; 4) Consider instruction tuning with carefully designed prompts if your goal is to improve the model\'s ability to follow instructions; 5) Use smaller models if possible - smaller models fine-tuned on domain-specific data often outperform larger general models; 6) For cost efficiency, optimize batch size and precision (e.g., using mixed precision training); 7) Implement proper evaluation metrics relevant to your specific use case; and 8) Document your fine-tuning process, including hyperparameters and data processing steps, to ensure reproducibility.',
    tags: ['language-models', 'fine-tuning', 'nlp', 'cost-optimization'],
    createdAt: new Date('2023-09-28'),
    updatedAt: new Date('2023-09-30'),
    votes: 51,
    author: 'user4'
  },
  {
    id: '5',
    title: 'How to implement semantic search with vector embeddings',
    content: 'I want to build a semantic search system for my document database. What's the current state-of-the-art approach using vector embeddings?',
    answer: 'To implement semantic search with vector embeddings: 1) Generate embeddings for your documents using models like OpenAI\'s text-embedding-ada-002, Sentence-BERT, or other domain-specific embedding models; 2) Store these embeddings in a vector database like Pinecone, Weaviate, Milvus, or FAISS for efficient similarity search; 3) At query time, convert the search query into an embedding using the same model; 4) Perform approximate nearest neighbor search to find documents with embeddings most similar to the query embedding; 5) Consider hybrid approaches that combine semantic search with keyword-based search for better results; 6) Implement re-ranking on top results to improve precision; and 7) For large document collections, use chunking strategies to break documents into smaller semantic units before embedding. This approach enables finding contextually relevant results even when exact keywords don\'t match, greatly improving search quality compared to traditional keyword-based approaches.',
    tags: ['semantic-search', 'embeddings', 'vector-database', 'information-retrieval'],
    createdAt: new Date('2023-09-18'),
    updatedAt: new Date('2023-09-20'),
    votes: 78,
    author: 'user5'
  },
  {
    id: '6',
    title: 'Understanding attention mechanisms in transformer models',
    content: 'Can someone explain in simple terms how attention mechanisms work in transformer models like GPT?',
    answer: 'Attention mechanisms in transformers allow the model to focus on different parts of the input sequence when producing each part of the output. In simple terms, for each word being processed, attention calculates how much "focus" should be given to every other word in the input. This is done by computing "compatibility scores" between words, which are then normalized into attention weights using softmax. In transformers specifically, we use multi-head self-attention, which means: 1) Self-attention - each position in the sequence attends to all positions in the same sequence; 2) Multi-head - attention is performed in parallel across different "representation subspaces" to capture different types of relationships. The key innovation is that attention allows direct connections between any two positions in a sequence, helping models handle long-range dependencies much better than previous architectures like RNNs. This is why transformers can maintain context across longer texts.',
    tags: ['transformers', 'attention-mechanism', 'deep-learning', 'nlp'],
    createdAt: new Date('2023-08-30'),
    updatedAt: new Date('2023-09-02'),
    votes: 92,
    author: 'user6'
  }
];

// Sample popular tags
const popularTags = [
  { id: '1', name: 'machine-learning', count: 124 },
  { id: '2', name: 'ai-ethics', count: 86 },
  { id: '3', name: 'nlp', count: 72 },
  { id: '4', name: 'transformers', count: 65 },
  { id: '5', name: 'deep-learning', count: 58 },
  { id: '6', name: 'computer-vision', count: 47 },
  { id: '7', name: 'reinforcement-learning', count: 39 },
  { id: '8', name: 'embeddings', count: 32 }
];

// Sorting options
const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'votes', label: 'Most Votes' },
  { value: 'trending', label: 'Trending' }
];

const Browse = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recent');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
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
  const filteredQuestions = sampleQuestions.filter(question => {
    const matchesSearch = searchTerm === '' || 
      question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => question.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });
  
  // Sort filtered questions
  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'votes') {
      return b.votes - a.votes;
    }
    // Default to recent
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
                      {popularTags.map(tag => (
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
                  {sortedQuestions.length} results
                </span>
              </div>
            </div>
            
            {sortedQuestions.length > 0 ? (
              <div className="grid gap-6">
                <AnimatePresence>
                  {sortedQuestions.map(question => (
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
