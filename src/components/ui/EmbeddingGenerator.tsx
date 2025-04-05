
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EmbeddingGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const generateEmbeddings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-embeddings');
      
      if (error) throw error;
      
      setResults(data);
      toast({
        title: 'Embedding Generation Complete',
        description: `Successfully generated ${data.successful} embeddings out of ${data.total} questions.`,
        variant: data.failed > 0 ? 'destructive' : 'default',
      });
    } catch (error) {
      console.error('Error generating embeddings:', error);
      toast({
        title: 'Error Generating Embeddings',
        description: error.message || 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Generate Question Embeddings</h2>
      
      <Button 
        onClick={generateEmbeddings} 
        disabled={loading}
        className="mb-4"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Embeddings...
          </>
        ) : (
          'Generate Embeddings'
        )}
      </Button>
      
      {results && (
        <div className="mt-4">
          <h3 className="font-medium">Results:</h3>
          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <p>Total Questions: {results.total}</p>
            <p className="text-green-600 dark:text-green-400">
              Successful: {results.successful}
            </p>
            {results.failed > 0 && (
              <p className="text-red-600 dark:text-red-400">
                Failed: {results.failed}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmbeddingGenerator;
