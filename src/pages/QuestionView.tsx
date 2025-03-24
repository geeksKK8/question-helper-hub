
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Question, Comment } from '@/lib/types';
import QuestionDetail from '@/components/questions/QuestionDetail';

// Sample data for questions and comments
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

const sampleComments: Comment[] = [
  {
    id: '1',
    questionId: '1',
    content: 'Great explanation! Could you also add how semi-supervised learning fits into this comparison?',
    createdAt: new Date('2023-10-23'),
    author: 'commentUser1'
  },
  {
    id: '2',
    questionId: '1',
    content: 'I found this very helpful for my coursework. Thanks for sharing!',
    createdAt: new Date('2023-10-24'),
    author: 'commentUser2'
  },
  {
    id: '3',
    questionId: '2',
    content: 'As a software developer myself, this made quantum computing much clearer. I especially liked the parallelism analogy.',
    createdAt: new Date('2023-10-16'),
    author: 'commentUser3'
  },
  {
    id: '4',
    questionId: '3',
    content: 'I\'d add that considering diverse perspectives during AI development is crucial for addressing potential biases.',
    createdAt: new Date('2023-10-13'),
    author: 'commentUser4'
  }
];

const QuestionView = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Simulate API fetch with timeout
    const fetchData = () => {
      setLoading(true);
      setTimeout(() => {
        const foundQuestion = sampleQuestions.find(q => q.id === questionId);
        if (foundQuestion) {
          setQuestion(foundQuestion);
          const questionComments = sampleComments.filter(c => c.questionId === questionId);
          setComments(questionComments);
          setError(null);
        } else {
          setError('Question not found');
        }
        setLoading(false);
      }, 500);
    };
    
    fetchData();
  }, [questionId]);
  
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
      <QuestionDetail question={question} comments={comments} />
    </div>
  );
};

export default QuestionView;
