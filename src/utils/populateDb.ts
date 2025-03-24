
import { supabase } from '@/integrations/supabase/client';

// Sample questions to populate the database
const sampleQuestions = [
  {
    title: 'How does reinforcement learning differ from supervised learning?',
    content: 'I\'m trying to understand the key differences between reinforcement learning and supervised learning approaches in AI.',
    answer: 'Supervised learning uses labeled data to teach models to make predictions, while reinforcement learning involves an agent learning to make decisions by taking actions in an environment to maximize rewards. Unlike supervised learning which has immediate feedback through labeled examples, reinforcement learning relies on delayed rewards and exploration of the environment. Supervised learning is used for classification and regression problems, while reinforcement learning is ideal for sequential decision-making tasks like game playing, robotics, and autonomous systems.',
    tags: ['machine-learning', 'reinforcement-learning', 'ai-theory'],
    votes: 42
  },
  {
    title: 'Explaining quantum computing to a software developer',
    content: 'As a traditional software developer, I\'m struggling to grasp quantum computing concepts. Can someone explain it in terms I might understand?',
    answer: 'Quantum computing leverages quantum mechanics principles to process information in ways classical computers cannot. While classical computers use bits (0 or 1), quantum computers use qubits that can exist in multiple states simultaneously through superposition. This allows quantum computers to evaluate many possibilities at once. Another key concept is entanglement, where qubits become correlated so that the state of one instantly affects another, regardless of distance. For a software developer, think of it as extreme parallelism where instead of sequential operations or limited parallel threads, quantum algorithms can explore exponentially many paths simultaneously. This makes quantum computers potentially much faster for specific problems like factoring large numbers, search, and optimization.',
    tags: ['quantum-computing', 'computer-science', 'beginners'],
    votes: 38
  },
  {
    title: 'Ethical considerations in developing AI systems',
    content: 'What are the main ethical considerations that developers should keep in mind when building AI systems?',
    answer: 'When developing AI systems, key ethical considerations include: 1) Bias and fairness - ensuring AI doesn\'t perpetuate or amplify existing societal biases; 2) Transparency and explainability - making sure decisions can be understood and explained; 3) Privacy - protecting personal data used to train and operate AI; 4) Accountability - establishing clear responsibility for AI actions; 5) Safety and security - preventing harmful outcomes or misuse; 6) Human autonomy - ensuring AI augments rather than replaces human decision-making in critical areas; 7) Social impact - considering effects on employment and society; and 8) Sustainability - accounting for environmental impacts of computing resources. Developers should implement ethics by design, conduct impact assessments, engage diverse stakeholders, and establish governance structures that continuously monitor systems.',
    tags: ['ethics', 'ai-ethics', 'responsible-ai'],
    votes: 65
  },
  {
    title: 'Best practices for fine-tuning large language models',
    content: 'I want to fine-tune a large language model for a specific domain. What are the current best practices to achieve good results while keeping costs reasonable?',
    answer: 'When fine-tuning large language models, consider these best practices: 1) Curate high-quality training data that\'s representative of your target domain and task; 2) Use parameter-efficient fine-tuning methods like LoRA, QLoRA, or adapter-based approaches to reduce computational costs; 3) Implement early stopping and evaluate on a validation set to prevent overfitting; 4) Consider instruction tuning with carefully designed prompts if your goal is to improve the model\'s ability to follow instructions; 5) Use smaller models if possible - smaller models fine-tuned on domain-specific data often outperform larger general models; 6) For cost efficiency, optimize batch size and precision (e.g., using mixed precision training); 7) Implement proper evaluation metrics relevant to your specific use case; and 8) Document your fine-tuning process, including hyperparameters and data processing steps, to ensure reproducibility.',
    tags: ['language-models', 'fine-tuning', 'nlp', 'cost-optimization'],
    votes: 51
  },
  {
    title: 'How to implement semantic search with vector embeddings',
    content: 'I want to build a semantic search system for my document database. What\'s the current state-of-the-art approach using vector embeddings?',
    answer: 'To implement semantic search with vector embeddings: 1) Generate embeddings for your documents using models like OpenAI\'s text-embedding-ada-002, Sentence-BERT, or other domain-specific embedding models; 2) Store these embeddings in a vector database like Pinecone, Weaviate, Milvus, or FAISS for efficient similarity search; 3) At query time, convert the search query into an embedding using the same model; 4) Perform approximate nearest neighbor search to find documents with embeddings most similar to the query embedding; 5) Consider hybrid approaches that combine semantic search with keyword-based search for better results; 6) Implement re-ranking on top results to improve precision; and 7) For large document collections, use chunking strategies to break documents into smaller semantic units before embedding. This approach enables finding contextually relevant results even when exact keywords don\'t match, greatly improving search quality compared to traditional keyword-based approaches.',
    tags: ['semantic-search', 'embeddings', 'vector-database', 'information-retrieval'],
    votes: 78
  },
  {
    title: 'Understanding attention mechanisms in transformer models',
    content: 'Can someone explain in simple terms how attention mechanisms work in transformer models like GPT?',
    answer: 'Attention mechanisms in transformers allow the model to focus on different parts of the input sequence when producing each part of the output. In simple terms, for each word being processed, attention calculates how much "focus" should be given to every other word in the input. This is done by computing "compatibility scores" between words, which are then normalized into attention weights using softmax. In transformers specifically, we use multi-head self-attention, which means: 1) Self-attention - each position in the sequence attends to all positions in the same sequence; 2) Multi-head - attention is performed in parallel across different "representation subspaces" to capture different types of relationships. The key innovation is that attention allows direct connections between any two positions in a sequence, helping models handle long-range dependencies much better than previous architectures like RNNs. This is why transformers can maintain context across longer texts.',
    tags: ['transformers', 'attention-mechanism', 'deep-learning', 'nlp'],
    votes: 92
  }
];

// Function to populate the database with sample questions
export const populateDatabase = async (userId: string) => {
  if (!userId) {
    console.error('User ID is required to populate the database');
    return { success: false, error: 'User ID is required' };
  }

  try {
    const { data: existingQuestions, error: checkError } = await supabase
      .from('questions')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing questions:', checkError);
      return { success: false, error: checkError.message };
    }

    // Only populate if no questions exist
    if (existingQuestions && existingQuestions.length === 0) {
      // Add questions
      const questionsWithAuthor = sampleQuestions.map(q => ({
        ...q,
        author_id: userId
      }));

      const { data, error } = await supabase
        .from('questions')
        .insert(questionsWithAuthor)
        .select();

      if (error) {
        console.error('Error populating database:', error);
        return { success: false, error: error.message };
      }

      console.log('Database populated successfully:', data);
      return { success: true, data };
    } else {
      console.log('Database already contains questions, skipping population');
      return { success: true, message: 'Database already contains questions' };
    }
  } catch (err) {
    console.error('Unexpected error populating database:', err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
};
