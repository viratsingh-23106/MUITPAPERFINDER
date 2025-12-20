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

// Function to fetch PDF and extract text (simplified - extracts readable text portions)
async function fetchPdfContent(fileUrl: string): Promise<string> {
  try {
    console.log("Fetching PDF from:", fileUrl);
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      console.error("Failed to fetch PDF:", response.status);
      return "";
    }

    // Get the PDF as array buffer
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to string and try to extract text content
    // This is a simplified extraction - looks for text streams in PDF
    let textContent = "";
    const decoder = new TextDecoder("utf-8", { fatal: false });
    const pdfText = decoder.decode(uint8Array);
    
    // Extract text between stream markers (simplified PDF text extraction)
    const streamMatches = pdfText.match(/stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g);
    if (streamMatches) {
      for (const match of streamMatches) {
        // Try to get readable text
        const content = match.replace(/stream[\r\n]+/, '').replace(/[\r\n]+endstream/, '');
        // Filter only printable ASCII characters
        const readable = content.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
        if (readable.length > 20 && readable.length < 5000) {
          textContent += readable + "\n";
        }
      }
    }

    // Also try to extract text from BT/ET blocks (text objects)
    const textBlocks = pdfText.match(/BT[\s\S]*?ET/g);
    if (textBlocks) {
      for (const block of textBlocks) {
        // Extract text from Tj and TJ operators
        const tjMatches = block.match(/\(([^)]*)\)\s*Tj/g);
        if (tjMatches) {
          for (const tj of tjMatches) {
            const text = tj.match(/\(([^)]*)\)/)?.[1] || '';
            if (text.length > 2) {
              textContent += text + " ";
            }
          }
        }
      }
    }

    // Clean up the extracted text
    textContent = textContent
      .replace(/[^\x20-\x7E\n\r]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    console.log("Extracted text length:", textContent.length);
    return textContent.slice(0, 15000); // Limit to avoid token limits
  } catch (error) {
    console.error("Error extracting PDF content:", error);
    return "";
  }
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

    // Fetch and extract PDF content
    console.log("Fetching PDF content for analysis...");
    const pdfContent = await fetchPdfContent(paperContext.fileUrl);
    
    const hasPdfContent = pdfContent.length > 100;
    console.log("PDF content available:", hasPdfContent, "Length:", pdfContent.length);

    // Build system prompt with paper context and actual content
    const systemPrompt = `You are an expert exam paper assistant helping students with exam papers. You have access to the actual content of the uploaded paper.

═══════════════════════════════════════════════════
                    PAPER DETAILS
═══════════════════════════════════════════════════
📚 Subject: ${paperContext.subject}
🎓 Course: ${paperContext.course}
🔬 Branch: ${paperContext.branch || "General"}
📅 Semester: ${paperContext.semester}
📆 Year: ${paperContext.year}

${hasPdfContent ? `
═══════════════════════════════════════════════════
              EXTRACTED PAPER CONTENT
═══════════════════════════════════════════════════
${pdfContent}
═══════════════════════════════════════════════════
` : `
NOTE: Could not extract text from PDF directly. Please analyze based on the paper details above. If the user asks about specific questions, ask them to share the question text.
`}

YOUR CAPABILITIES:

1️⃣ **ANSWER THIS PAPER'S QUESTIONS**
   - Analyze the extracted content above carefully
   - Identify each question from the paper
   - Provide detailed, step-by-step answers
   - Include formulas, diagrams (described), and examples where needed
   - Format answers with proper numbering matching the paper

2️⃣ **GENERATE SIMILAR EXAM PAPER**
   When generating a new paper, STRICTLY follow this format:

   ┌─────────────────────────────────────────────────┐
   │           [UNIVERSITY/COLLEGE NAME]            │
   │          ${paperContext.course.toUpperCase()} EXAMINATION ${paperContext.year}           │
   │                                                 │
   │  Subject: ${paperContext.subject}              │
   │  Semester: ${paperContext.semester} | Branch: ${paperContext.branch || "General"}  │
   │  Time: 3 Hours              Max Marks: 100     │
   └─────────────────────────────────────────────────┘

   Instructions:
   1. Attempt any FIVE questions from Section A & B
   2. Each question carries equal marks
   3. Diagrams should be drawn wherever necessary

   ══════════════════════════════════════════════════
                      SECTION A
           (Short Answer Questions - 2-3 marks each)
   ══════════════════════════════════════════════════

   Q1. [Question text]
   Q2. [Question text]
   ... (5-8 short questions)

   ══════════════════════════════════════════════════
                      SECTION B
           (Long Answer Questions - 10-15 marks each)
   ══════════════════════════════════════════════════

   Q1. [Detailed question with parts a, b, c if needed]
   Q2. [Question text]
   ... (4-5 long questions)

   ══════════════════════════════════════════════════

3️⃣ **ANSWER GENERATED PAPER**
   - Provide comprehensive answers for any AI-generated questions
   - Use the same format and structure

4️⃣ **EXPLAIN TOPICS**
   - Break down concepts from the paper
   - Provide examples and analogies

IMPORTANT GUIDELINES:
✓ Base your answers on the ACTUAL paper content extracted above
✓ Match the difficulty level and question style of the original paper
✓ Use proper academic formatting
✓ Include relevant formulas, diagrams, and examples
✓ Number questions exactly as they appear in the paper when answering`;

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
