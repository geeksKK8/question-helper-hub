import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Check, Tag, X, PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  message_id: number;
  role: string;
  content: string;
}

interface ParsedJson {
  title: string;
  userQuestions: string[];
  aiAnswers: string[];
  url?: string;
}

const JsonUploader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedJson | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setParsedData(null);
      setTags([]);
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (tags.includes(tagInput.trim())) {
      toast.error('Tag already exists');
      return;
    }
    if (tags.length >= 5) {
      toast.error('Maximum 5 tags allowed');
      return;
    }
    setTags([...tags, tagInput.trim()]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
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
      const url = jsonData?.url;
      
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

      setParsedData({ title, userQuestions, aiAnswers, url });
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

    if (tags.length === 0) {
      toast.error('Please add at least one tag');
      return;
    }

    try {
      setIsUploading(true);
      
      // Submit to Supabase - using custom tags instead of default ones
      const { data, error } = await supabase
        .from('questions')
        .insert([
          {
            title: parsedData.title,
            content: parsedData.userQuestions,
            answer: parsedData.aiAnswers,
            tags: tags,
            author_id: user.id,
            url: parsedData.url
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast.success('Your question has been submitted successfully!');
      
      // Reset state
      setSelectedFile(null);
      setParsedData(null);
      setTags([]);
      
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

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags (max 5)
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  id="tags"
                  placeholder="Add tags..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleAddTag}
                  size="icon"
                >
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div 
                    key={tag} 
                    className="flex items-center bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm dark:bg-gray-700 dark:text-gray-200"
                  >
                    <span>{tag}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={handleSubmit} 
              className="w-full"
              disabled={isUploading || tags.length === 0}
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
