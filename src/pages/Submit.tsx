
import QuestionForm from '@/components/questions/QuestionForm';
import useRequireAuth from '@/hooks/useRequireAuth';

const Submit = () => {
  // Use the auth hook to require authentication
  const { user, isLoading } = useRequireAuth();
  
  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Submit a Question
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Share your AI-generated answers and get feedback from the community
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : user ? (
          <QuestionForm />
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Please sign in to submit a question
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Submit;
