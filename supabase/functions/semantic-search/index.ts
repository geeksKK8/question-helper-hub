
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { query, type } = await req.json()

    if (type === 'embedding') {
      // Generate embedding using Google Gemini API
      const embeddingResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-exp-03-07:embedContent?key=${GEMINI_API_KEY}`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "models/gemini-embedding-exp-03-07",
            content: {
              parts: [{ text: query }]
            }
          })
        }
      )

      const embeddingData = await embeddingResponse.json()
      const embedding = embeddingData.embedding.values

      return new Response(JSON.stringify({ embedding }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else if (type === 'search') {
      // Generate query embedding
      const embeddingResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-exp-03-07:embedContent?key=${GEMINI_API_KEY}`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "models/gemini-embedding-exp-03-07",
            content: {
              parts: [{ text: query }]
            }
          })
        }
      )

      const embeddingData = await embeddingResponse.json()
      const queryEmbedding = embeddingData.embedding.values

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
