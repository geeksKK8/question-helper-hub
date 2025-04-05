
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { query, type } = await req.json()

    if (type === 'embedding') {
      // Generate embedding for the query
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: query,
          model: "text-embedding-ada-002"
        })
      })

      const embeddingData = await embeddingResponse.json()
      const embedding = embeddingData.data[0].embedding

      return new Response(JSON.stringify({ embedding }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else if (type === 'search') {
      // Perform semantic search in Supabase
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: query,
          model: "text-embedding-ada-002"
        })
      })

      const embeddingData = await embeddingResponse.json()
      const queryEmbedding = embeddingData.data[0].embedding

      // Call Supabase function to find similar questions
      const supabaseResponse = await fetch(`https://ejoiyuobalmjfvgzsclq.supabase.co/rest/v1/rpc/match_questions`, {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqb2l5dW9iYWxtamZ2Z3pzY2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MjExODAsImV4cCI6MjA1ODM5NzE4MH0.nGz3SO8Gtvnj7o5VDkF6J5MrGKnZ3K2JLCjs8n8-ie8',
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          query_embedding: queryEmbedding,
          match_threshold: 0.7,
          match_count: 5
        })
      })

      const similarQuestions = await supabaseResponse.json()

      return new Response(JSON.stringify(similarQuestions), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid request type' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in semantic search function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
