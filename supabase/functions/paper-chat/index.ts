import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractText } from "https://esm.sh/unpdf@0.12.1";

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

// Function to extract text from PDF using unpdf
async function extractPdfText(fileUrl: string): Promise<string> {
  try {
    console.log("Fetching PDF from:", fileUrl);
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      console.error("Failed to fetch PDF:", response.status);
      return "";
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log("PDF size:", arrayBuffer.byteLength, "bytes");
    
    // Extract text using unpdf
    const { text, totalPages } = await extractText(arrayBuffer, { mergePages: true });
    console.log("Extracted text from", totalPages, "pages, length:", text.length);
    
    // Clean up text
    const cleanedText = text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
    
    return cleanedText.slice(0, 25000); // Limit to avoid token limits
    
  } catch (error) {
    console.error("PDF extraction error:", error);
    
    // Enhanced fallback extraction
    try {
      console.log("Trying enhanced fallback extraction...");
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const decoder = new TextDecoder("latin1", { fatal: false });
      const rawText = decoder.decode(uint8Array);
      
      let extractedText = "";
      
      // Pattern 1: Text in parentheses with Tj operator
      const tjPattern = /\(([^\\()]+(?:\\.[^\\()]*)*)\)\s*Tj/g;
      let match;
      while ((match = tjPattern.exec(rawText)) !== null) {
        let text = match[1]
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\\\/g, '\\')
          .replace(/\\(.)/g, '$1');
        if (text.length > 0) extractedText += text + " ";
      }
      
      // Pattern 2: TJ array operator (multiple strings)
      const tjArrayPattern = /\[((?:[^[\]]*|\([^)]*\))*)\]\s*TJ/gi;
      while ((match = tjArrayPattern.exec(rawText)) !== null) {
        const content = match[1];
        const stringPattern = /\(([^)]*)\)/g;
        let strMatch;
        while ((strMatch = stringPattern.exec(content)) !== null) {
          let text = strMatch[1]
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '')
            .replace(/\\(.)/g, '$1');
          if (text.length > 0) extractedText += text;
        }
        extractedText += " ";
      }
      
      // Pattern 3: Unicode text (hex encoded)
      const hexPattern = /<([0-9A-Fa-f]+)>\s*Tj/g;
      while ((match = hexPattern.exec(rawText)) !== null) {
        const hex = match[1];
        let text = "";
        for (let i = 0; i < hex.length; i += 4) {
          const code = parseInt(hex.substr(i, 4), 16);
          if (code > 31 && code < 127) {
            text += String.fromCharCode(code);
          } else if (code > 127) {
            text += String.fromCharCode(code);
          }
        }
        if (text.length > 0) extractedText += text + " ";
      }
      
      // Clean up
      extractedText = extractedText
        .replace(/[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F\n]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      console.log("Fallback extraction length:", extractedText.length);
      return extractedText.slice(0, 25000);
      
    } catch (fallbackError) {
      console.error("Fallback extraction failed:", fallbackError);
      return "";
    }
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

    // Extract PDF content
    console.log("Extracting PDF content for:", paperContext.subject);
    const pdfContent = await extractPdfText(paperContext.fileUrl);
    
    const hasPdfContent = pdfContent.length > 50;
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
                    PAPER CONTENT (EXTRACTED)
═══════════════════════════════════════════════════════════════
${pdfContent}
═══════════════════════════════════════════════════════════════
` : `
⚠️ NOTE: Could not extract text from this PDF automatically. 
The user can share specific questions by typing them, and you will answer.
`}

═══════════════════════════════════════════════════════════════
                       YOUR CAPABILITIES
═══════════════════════════════════════════════════════════════

📝 **1. ANSWER QUESTIONS FROM THIS PAPER**
   - Carefully read the extracted paper content above
   - Identify each question and provide detailed answers
   - Include step-by-step solutions with formulas
   - Draw diagrams in ASCII art when needed
   - Use proper numbering (Q1a, Q1b, Q2, etc.)

📄 **2. GENERATE A SIMILAR EXAM PAPER**
   When asked to generate a new paper, use EXACTLY this format:

   ╔═══════════════════════════════════════════════════════════╗
   ║              [UNIVERSITY/INSTITUTION NAME]               ║
   ║        ${paperContext.course.toUpperCase()} EXAMINATION - ${paperContext.year}         ║
   ╠═══════════════════════════════════════════════════════════╣
   ║  Subject: ${paperContext.subject.padEnd(40)}║
   ║  Semester: ${paperContext.semester} | Branch: ${(paperContext.branch || "General").padEnd(20)}║
   ║  Time: 3 Hours                    Maximum Marks: 100     ║
   ╚═══════════════════════════════════════════════════════════╝

   INSTRUCTIONS:
   1. All questions are compulsory
   2. Attempt any FIVE questions from each section
   3. Draw neat diagrams wherever required
   4. Assume suitable data if necessary

   ════════════════════════════════════════════════════════════
                          SECTION A
                  (Short Answer Questions: 2-5 marks each)
   ════════════════════════════════════════════════════════════

   Q.1  [Question text here]                              [2M]
   Q.2  [Question text here]                              [3M]
   ... (continue with 6-8 short questions)

   ════════════════════════════════════════════════════════════
                          SECTION B
                  (Long Answer Questions: 10-15 marks each)
   ════════════════════════════════════════════════════════════

   Q.1  [Main question]                                   [10M]
        (a) [Part a]
        (b) [Part b]
        (c) [Part c]

   Q.2  [Another long question]                           [15M]
   ... (continue with 4-5 long questions)

   ════════════════════════════════════════════════════════════
                          END OF PAPER
   ════════════════════════════════════════════════════════════

✅ **3. ANSWER GENERATED PAPER**
   - Provide complete solutions for any AI-generated questions
   - Follow the same detailed format

📖 **4. EXPLAIN CONCEPTS**
   - Break down topics from the paper
   - Provide examples and real-world applications

═══════════════════════════════════════════════════════════════
                       IMPORTANT RULES
═══════════════════════════════════════════════════════════════
✓ ALWAYS base answers on the extracted paper content above
✓ Match the difficulty level and style of the original paper
✓ Use proper academic formatting and numbering
✓ Include formulas in clear notation
✓ Describe diagrams in detail or use ASCII art
✓ If paper content is not available, ask user to share questions
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
