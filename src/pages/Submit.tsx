
import { useState, useEffect } from 'react';
import QuestionForm from '@/components/questions/QuestionForm';
import JsonUploader from '@/components/questions/JsonUploader';
import useRequireAuth from '@/hooks/useRequireAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';

const Submit = () => {
  const navigate = useNavigate();
  // Use the auth hook to require authentication
  const { user, isLoading, session } = useRequireAuth();
  const [activeTab, setActiveTab] = useState<string>("form");
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
    // Once loading is complete and we know the auth state, mark auth as checked
    if (!isLoading) {
      setAuthChecked(true);
    }
  }, [isLoading]);

  // Don't render anything until we've checked auth status
  if (!authChecked) {
    return (
      <div className="flex justify-center items-center min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
          <Tabs defaultValue="form" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="form">Manual Entry</TabsTrigger>
              <TabsTrigger value="json">JSON Upload</TabsTrigger>
            </TabsList>
            <TabsContent value="form">
              <QuestionForm />
            </TabsContent>
            <TabsContent value="json">
              <JsonUploader />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 shadow-md rounded-xl p-8">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              Please sign in to submit a question
            </p>
            <button 
              onClick={() => navigate('/auth')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Submit;
