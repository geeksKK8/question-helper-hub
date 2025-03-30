
import { useState, useEffect } from 'react';
import QuestionForm from '@/components/questions/QuestionForm';
import JsonUploader from '@/components/questions/JsonUploader';
import useRequireAuth from '@/hooks/useRequireAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DeepSeekData } from '@/lib/types';

// Handle API request for direct upload
const handleApiUpload = async (req: Request) => {
  try {
    console.log("API upload request received");
    
    // Check API key format in URL
    const url = new URL(req.url);
    const apiKey = url.searchParams.get('key');
    
    if (!apiKey || !apiKey.startsWith('key_')) {
      console.error("Invalid API key format");
      return new Response(JSON.stringify({ error: 'Invalid API key' }), { 
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        } 
      });
    }
    
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        status: 204,
      });
    }
    
    // Get JSON data from request
    const jsonData: DeepSeekData = await req.json();
    console.log("Request data received and parsed");
    
    // Validate session and get user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error("No authenticated session found");
      return new Response(JSON.stringify({ error: 'Authentication required' }), { 
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      });
    }
    
    const user = session.user;
    
    // Process DeepSeek data
    const chatSession = jsonData?.data?.biz_data?.chat_session;
    const chatMessages = jsonData?.data?.biz_data?.chat_messages;

    if (!chatSession || !chatMessages || !Array.isArray(chatMessages)) {
      console.error("Invalid data format received");
      return new Response(JSON.stringify({ error: 'Invalid data format' }), { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      });
    }

    const title = chatSession.title || 'Untitled Conversation';
    const url = jsonData?.url;
    
    // Extract user questions and AI answers
    const userQuestions: string[] = [];
    const aiAnswers: string[] = [];
    
    chatMessages.forEach((message: any) => {
      if (message.role === 'USER' && message.content) {
        userQuestions.push(message.content);
      } else if (message.role === 'ASSISTANT' && message.content) {
        aiAnswers.push(message.content);
      }
    });

    if (userQuestions.length === 0) {
      console.error("No user questions found in data");
      return new Response(JSON.stringify({ error: 'No user questions found in the data' }), { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      });
    }

    // Use AI-related tags by default for direct submissions
    const defaultTags = ["deepseek", "ai-conversation"];
    
    console.log("Submitting to Supabase...");
    // Submit to Supabase
    const { data, error } = await supabase
      .from('questions')
      .insert([
        {
          title,
          content: userQuestions,
          answer: aiAnswers,
          tags: defaultTags,
          author_id: user.id,
          url
        }
      ])
      .select();
    
    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }
    
    console.log("Question submitted successfully");
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Question submitted successfully',
      questionId: data && data[0] ? data[0].id : null
    }), { 
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      } 
    });
  
  } catch (error: any) {
    console.error('API submission error:', error);
    return new Response(JSON.stringify({ 
      error: `Error submitting question: ${error.message}` 
    }), { 
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      } 
    });
  }
};

// Custom event listener for API calls
class APIHandler extends EventTarget {
  handleEvent(event: Event) {
    if (event instanceof FetchEvent && event.request.url.includes('/api/upload')) {
      event.respondWith(handleApiUpload(event.request));
    }
  }
}

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

  // Set up API route handler
  useEffect(() => {
    // Create a proper API route handler with fetch event
    if (typeof window !== 'undefined') {
      // Create a route handler for /api/upload
      const apiRoute = '/api/upload';
      
      // Override fetch for our specific API route
      const originalFetch = window.fetch;
      window.fetch = function(input, init) {
        if (typeof input === 'string' && input.includes(apiRoute)) {
          return handleApiUpload(new Request(input, init))
            .then(response => Promise.resolve(response));
        }
        return originalFetch.apply(this, [input, init]);
      };
    }
  }, []);

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
