
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionCard from '@/components/questions/QuestionCard';
import { Question } from '@/lib/types';
import TagBadge from '@/components/ui/TagBadge';

// Sample data for featured questions
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
  }
];

// Available filter categories
const categories = [
  { id: 'trending', name: 'Trending' },
  { id: 'recent', name: 'Recent' },
  { id: 'most-voted', name: 'Most Voted' },
];

const FeaturedQuestions = () => {
  const [activeCategory, setActiveCategory] = useState('trending');
  
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
            {sampleQuestions.map((question) => (
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
            ))}
          </AnimatePresence>
        </div>
        
        <div className="mt-12 text-center">
          <TagBadge tag="machine-learning" count={124} className="m-1" />
          <TagBadge tag="ai-ethics" count={86} className="m-1" />
          <TagBadge tag="computer-vision" count={72} className="m-1" />
          <TagBadge tag="natural-language-processing" count={65} className="m-1" />
          <TagBadge tag="deep-learning" count={58} className="m-1" />
        </div>
      </div>
    </section>
  );
};

export default FeaturedQuestions;
