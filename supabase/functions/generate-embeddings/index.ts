
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const SUPABASE_URL = "https://ejoiyuobalmjfvgzsclq.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting embedding generation process')

    // Fetch questions with null embeddings
    const questionsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/questions?select=id,title&title_embedding=is.null`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    )

    const questions = await questionsResponse.json()
    console.log(`Found ${questions.length} questions without embeddings`)

    const results = []
    let successCount = 0
    let errorCount = 0

    // Process each question
    for (const question of questions) {
      try {
        console.log(`Processing question ID: ${question.id}, Title: ${question.title}`)
        
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
                parts: [{ text: question.title }]
              }
            })
          }
        )

        const embeddingData = await embeddingResponse.json()
        
        if (!embeddingData.embedding || !embeddingData.embedding.values) {
          console.error(`Failed to generate embedding for question ${question.id}:`, embeddingData)
          results.push({ id: question.id, status: 'failed', error: 'No embedding in response' })
          errorCount++
          continue
        }

        const embedding = embeddingData.embedding.values

        // Update the question with the embedding
        const updateResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/questions?id=eq.${question.id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              title_embedding: embedding
            })
          }
        )

        if (updateResponse.ok) {
          console.log(`Successfully updated embedding for question ${question.id}`)
          results.push({ id: question.id, status: 'success' })
          successCount++
        } else {
          console.error(`Failed to update question ${question.id}:`, await updateResponse.text())
          results.push({ id: question.id, status: 'failed', error: 'Database update failed' })
          errorCount++
        }
      } catch (error) {
        console.error(`Error processing question ${question.id}:`, error)
        results.push({ id: question.id, status: 'failed', error: error.message })
        errorCount++
      }

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    const summary = {
      total: questions.length,
      successful: successCount,
      failed: errorCount,
      results
    }

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in generate-embeddings function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
