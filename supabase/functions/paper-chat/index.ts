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

// Function to convert PDF to images and extract text using vision AI
async function extractPdfWithVision(fileUrl: string, apiKey: string): Promise<string> {
  try {
    console.log("Fetching PDF from:", fileUrl);
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      console.error("Failed to fetch PDF:", response.status);
      return "";
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    console.log("PDF size:", arrayBuffer.byteLength, "bytes");
    
    // Use vision model to extract text from PDF
    console.log("Using vision AI to extract PDF content...");
    
    const visionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extract ALL text content from this exam paper PDF. Include:
- University/college name and header
- Subject name, course, semester, year
- All instructions
- EVERY question with complete text, sub-parts (a, b, c...), and marks
- Section headers (Section A, Section B)
- Any other important information

Format the output clearly with proper structure. Do not summarize - extract the COMPLETE text as it appears.`
              },
              {
                type: "file",
                file: {
                  filename: "paper.pdf",
                  file_data: `data:application/pdf;base64,${base64Pdf}`
                }
              }
            ]
          }
        ],
        max_tokens: 8000,
      }),
    });

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error("Vision API error:", visionResponse.status, errorText);
      return "";
    }

    const visionData = await visionResponse.json();
    const extractedText = visionData.choices?.[0]?.message?.content || "";
    console.log("Vision extraction successful, length:", extractedText.length);
    
    return extractedText.slice(0, 30000);
    
  } catch (error) {
    console.error("PDF extraction error:", error);
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

    // Extract PDF content using vision
    console.log("Extracting PDF content for:", paperContext.subject);
    const pdfContent = await extractPdfWithVision(paperContext.fileUrl, LOVABLE_API_KEY);
    
    const hasPdfContent = pdfContent.length > 100;
    console.log("PDF content available:", hasPdfContent, "Length:", pdfContent.length);

    // Build system prompt with extracted content
    const systemPrompt = `You are an expert exam paper assistant. You help students understand exam papers, answer questions, and generate similar practice papers.

═══════════════════════════════════════════════════════════════
                         PAPER INFORMATION
═══════════════════════════════════════════════════════════════
📚 Subject: ${paperContext.subject}
🎓 Course: ${paperContext.course}
🔬 Branch: ${paperContext.branch || "General"}
📅 Semester: ${paperContext.semester}
📆 Year: ${paperContext.year}

${hasPdfContent ? `
═══════════════════════════════════════════════════════════════
              EXTRACTED PAPER CONTENT (FULL TEXT)
═══════════════════════════════════════════════════════════════
${pdfContent}
═══════════════════════════════════════════════════════════════

IMPORTANT: The above content was extracted from the actual uploaded PDF. 
Use this EXACT content to:
1. Answer questions from this paper
2. Generate similar papers with the same format and difficulty
3. Base all responses on this actual paper content
` : `
⚠️ NOTE: Could not extract text from this PDF automatically. 
The user can share specific questions by typing them, and you will answer.
`}

═══════════════════════════════════════════════════════════════
                       YOUR CAPABILITIES
═══════════════════════════════════════════════════════════════

📝 **1. ANSWER QUESTIONS FROM THIS PAPER**
   - Read the extracted paper content above carefully
   - Provide detailed step-by-step solutions for each question
   - Include formulas, diagrams (ASCII art), and explanations
   - Match the marking scheme (e.g., 2M, 5M, 10M questions)
   - Number answers exactly as in the paper (Q1, Q2, Q3a, Q3b, etc.)

📄 **2. GENERATE A SIMILAR EXAM PAPER**
   When generating a new paper:
   - Use the EXACT SAME FORMAT as the original paper
   - Keep the same header style, sections, marks distribution
   - Create NEW questions on the SAME topics
   - Match the difficulty level exactly
   
   Format to use:

   ╔═══════════════════════════════════════════════════════════╗
   ║              [UNIVERSITY/INSTITUTION NAME]               ║
   ║        ${paperContext.course.toUpperCase()} EXAMINATION - ${paperContext.year}         ║
   ╠═══════════════════════════════════════════════════════════╣
   ║  Subject: ${paperContext.subject.padEnd(40)}║
   ║  Semester: ${paperContext.semester} | Branch: ${(paperContext.branch || "General").padEnd(20)}║
   ║  Time: 3 Hours                    Maximum Marks: 100     ║
   ╚═══════════════════════════════════════════════════════════╝

   INSTRUCTIONS:
   [Copy the same instructions from original paper]

   ════════════════════════════════════════════════════════════
                          SECTION A
                  (Short Answer Questions)
   ════════════════════════════════════════════════════════════

   Q.1  [New question on same topic as original Q1]       [Marks]
   Q.2  [New question on same topic as original Q2]       [Marks]
   ...

   ════════════════════════════════════════════════════════════
                          SECTION B
                  (Long Answer Questions)
   ════════════════════════════════════════════════════════════

   Q.1  [Main question]                                   [Marks]
        (a) [Part a]
        (b) [Part b]
   ...

   ════════════════════════════════════════════════════════════
                          END OF PAPER
   ════════════════════════════════════════════════════════════

✅ **3. ANSWER ANY QUESTION**
   - Answer user's specific questions about topics in the paper
   - Explain concepts from the syllabus
   - Provide examples and applications

═══════════════════════════════════════════════════════════════
                       IMPORTANT RULES
═══════════════════════════════════════════════════════════════
✓ ALWAYS use the extracted paper content as your primary reference
✓ Match the original paper's format, style, and difficulty
✓ Include step-by-step solutions with proper formulas
✓ Draw diagrams using ASCII art when needed
✓ Be accurate and academically rigorous
═══════════════════════════════════════════════════════════════`;

    console.log("Sending request to Lovable AI...");

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
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
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
