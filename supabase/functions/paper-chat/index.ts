import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaperContext {
  subject: string;
  course: string;
  branch?: string;
  semester: string;
  year: string;
  fileUrl: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, paperContext } = await req.json() as {
      messages: ChatMessage[];
      paperContext: PaperContext;
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service is not configured");
    }

    // Build system prompt with paper context
    const systemPrompt = `You are an intelligent AI assistant helping students with exam papers.

PAPER CONTEXT:
- Subject: ${paperContext.subject}
- Course: ${paperContext.course}
- Branch: ${paperContext.branch || "N/A"}
- Semester: ${paperContext.semester}
- Year: ${paperContext.year}

You can help users with:
1. **Generate Similar Papers**: Create new exam questions on the same topics with similar difficulty
2. **Answer Existing Papers**: Provide detailed, accurate answers for questions from the paper
3. **Explain Topics**: Break down complex concepts covered in the paper
4. **Answer Generated Papers**: Provide solutions for any AI-generated questions

Guidelines:
- Be educational and thorough in explanations
- When generating new papers, maintain similar format, difficulty, and question types
- When answering questions, provide step-by-step solutions where applicable
- Always relate content to the specific subject and semester level
- Format responses clearly with proper headings and numbering
- If asked to generate a paper, include at least 5-10 questions with varying types (MCQ, short answer, long answer)`;

    console.log("Sending request to Lovable AI for paper:", paperContext.subject);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // Stream the response back
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("paper-chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
