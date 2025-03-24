
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import TagBadge from '@/components/ui/TagBadge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, X } from 'lucide-react';

const QuestionForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    question: '',
    answer: '',
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const goToNextStep = () => {
    if (currentStep === 1 && !formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (currentStep === 2 && !formData.question.trim()) {
      toast.error('Please enter your question');
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const goToPrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.answer.trim()) {
      toast.error('Please enter the AI answer');
      return;
    }
    
    if (tags.length === 0) {
      toast.error('Please add at least one tag');
      return;
    }
    
    // Here you would typically make an API call to submit the question
    console.log({ ...formData, tags });
    
    toast.success('Your question has been submitted successfully!');
    
    // Reset form data
    setFormData({
      title: '',
      question: '',
      answer: '',
    });
    setTags([]);
    setCurrentStep(1);
    
    // Navigate to homepage
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  const formVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.3 } },
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="glass-card p-8 rounded-xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
          Submit Your Question
        </h1>
        
        <div className="mb-8">
          <div className="relative">
            <div className="flex items-center justify-between">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep > index + 1 
                        ? 'bg-green-500 text-white' 
                        : currentStep === index + 1 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    {index === 0 ? 'Title' : index === 1 ? 'Question' : 'Answer & Tags'}
                  </span>
                </div>
              ))}
            </div>
            <div className="absolute top-4 h-0.5 w-full bg-gray-200 dark:bg-gray-700 -z-10"></div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <motion.div
            key={currentStep}
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {currentStep === 1 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  What's your question about?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Be specific and imagine you're asking a question to a person.
                </p>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., How does ChatGPT handle contextual understanding?"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 2 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Describe your question in detail
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Include all the information someone would need to answer your question.
                </p>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="question" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Question Details
                    </label>
                    <Textarea
                      id="question"
                      name="question"
                      placeholder="Explain your question in detail..."
                      value={formData.question}
                      onChange={handleChange}
                      className="min-h-[200px]"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 3 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Add the AI-generated answer and tags
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Paste the AI's response and add relevant tags to help others find your question.
                </p>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="answer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      AI Answer
                    </label>
                    <Textarea
                      id="answer"
                      name="answer"
                      placeholder="Paste the AI-generated answer here..."
                      value={formData.answer}
                      onChange={handleChange}
                      className="min-h-[200px]"
                    />
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
                </div>
              </div>
            )}
          </motion.div>
          
          <div className="mt-8 flex justify-between">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={goToPrevStep}>
                Back
              </Button>
            ) : (
              <div></div>
            )}
            
            {currentStep < totalSteps ? (
              <Button type="button" onClick={goToNextStep}>
                Next
              </Button>
            ) : (
              <Button type="submit">
                Submit Question
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionForm;
