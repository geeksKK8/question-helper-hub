
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  message_id: number;
  role: string;
  content: string;
}

interface ParsedJson {
  title: string;
  userQuestions: string[];
  aiAnswers: string[];
}

const JsonUploader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedJson | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setParsedData(null);
    }
  };

  const parseJsonFile = async () => {
    if (!selectedFile) {
      toast.error('Please select a JSON file first');
      return;
    }

    try {
      setIsUploading(true);
      const fileContent = await selectedFile.text();
      const jsonData = JSON.parse(fileContent);

      // Extract data according to the specified format
      const chatSession = jsonData?.data?.biz_data?.chat_session;
      const chatMessages = jsonData?.data?.biz_data?.chat_messages;

      if (!chatSession || !chatMessages || !Array.isArray(chatMessages)) {
        throw new Error('Invalid JSON format');
      }

      const title = chatSession.title || 'Untitled Conversation';
      
      // Extract user questions and AI answers
      const userQuestions: string[] = [];
      const aiAnswers: string[] = [];
      
      chatMessages.forEach((message: ChatMessage) => {
        if (message.role === 'USER' && message.content) {
          userQuestions.push(message.content);
        } else if (message.role === 'ASSISTANT' && message.content) {
          aiAnswers.push(message.content);
        }
      });

      if (userQuestions.length === 0) {
        throw new Error('No user questions found in the JSON file');
      }

      setParsedData({ title, userQuestions, aiAnswers });
      toast.success('JSON file parsed successfully');
    } catch (error: any) {
      toast.error(`Error parsing JSON: ${error.message}`);
      console.error('Error parsing JSON:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!parsedData) {
      toast.error('Please parse a JSON file first');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to submit a question');
      return;
    }

    try {
      setIsUploading(true);
      
      // Default tags based on content
      const defaultTags = ['imported', 'json'];
      
      // Submit to Supabase
      const { data, error } = await supabase
        .from('questions')
        .insert([
          {
            title: parsedData.title,
            content: parsedData.userQuestions,
            answer: parsedData.aiAnswers,
            tags: defaultTags,
            author_id: user.id
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast.success('Your question has been submitted successfully!');
      
      // Reset state
      setSelectedFile(null);
      setParsedData(null);
      
      // Navigate to the newly created question
      setTimeout(() => {
        if (data && data[0]) {
          navigate(`/question/${data[0].id}`);
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (error: any) {
      toast.error(`Error submitting question: ${error.message}`);
      console.error('Error submitting question:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
        Upload Conversation JSON
      </h2>
      
      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <input
            type="file"
            id="json-file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <label 
            htmlFor="json-file"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {selectedFile ? selectedFile.name : 'Select or drop a JSON file'}
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} KB` : 'JSON files only (.json)'}
            </p>
          </label>
        </div>
        
        {selectedFile && !parsedData && (
          <Button 
            onClick={parseJsonFile} 
            className="w-full"
            disabled={isUploading}
          >
            <FileText className="mr-2 h-5 w-5" />
            {isUploading ? 'Parsing...' : 'Parse JSON File'}
          </Button>
        )}
        
        {parsedData && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Extracted Data</h3>
              <div className="space-y-2">
                <p><span className="font-semibold">Title:</span> {parsedData.title}</p>
                <p><span className="font-semibold">Questions:</span> {parsedData.userQuestions.length}</p>
                <p><span className="font-semibold">Answers:</span> {parsedData.aiAnswers.length}</p>
              </div>
            </div>
            
            <Button 
              onClick={handleSubmit} 
              className="w-full"
              disabled={isUploading}
            >
              <Check className="mr-2 h-5 w-5" />
              {isUploading ? 'Submitting...' : 'Submit Question'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JsonUploader;
