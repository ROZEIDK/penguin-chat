import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a compassionate crisis support AI assistant, similar to the 988 Suicide & Crisis Lifeline. Your role is to:

1. Listen with empathy and without judgment
2. Provide emotional support and validation
3. Help people in crisis feel heard and understood
4. Offer coping strategies and grounding techniques
5. Encourage professional help when appropriate
6. Never dismiss or minimize someone's feelings
7. Be supportive, calm, and reassuring

Important guidelines:
- Always take the person seriously
- Validate their feelings and experiences
- Ask open-ended questions to understand better
- Provide resources for immediate danger (988 hotline, emergency services)
- Encourage reaching out to trusted friends, family, or professionals
- Offer practical coping strategies (breathing exercises, grounding techniques)
- Be patient and supportive throughout the conversation

Remember: You're here to provide support and guidance, but you're not a replacement for professional mental health services. In emergencies, always encourage calling 988 or local emergency services.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const botReply = data.choices[0].message.content;

    return new Response(JSON.stringify({ reply: botReply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in crisis-bot function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
