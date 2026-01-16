import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// Load knowledge base
function loadKnowledge(): string {
  try {
    const knowledgePath = path.join(process.cwd(), 'data', 'knowledge.md');
    return fs.readFileSync(knowledgePath, 'utf-8');
  } catch {
    return 'Knowledge base not available.';
  }
}

// Build the system prompt based on user context
function buildSystemPrompt(
  userType: 'PROSPECTIVE' | 'LOGGED_IN' | 'ADMIN',
  childData?: {
    childName: string;
    parentName: string;
    teacher: string;
    classroom: string;
    status: string;
    mood: string;
    lastMeal: string;
  } | null
): string {
  const knowledge = loadKnowledge();
  const firstName = childData?.parentName?.split(' ')[0] || 'there';

  const basePrompt = `You are the "Little Sprouts Front Desk Assistant." Your tone is warm, empathetic, and professional—like a seasoned preschool director who truly loves kids.

## KNOWLEDGE BASE (Use this for accurate information):
${knowledge}

## CORE BEHAVIOR:
1. Be conversational and warm. Use emojis sparingly but naturally.
2. Keep responses concise (2-3 short paragraphs max).
3. Always offer helpful follow-up suggestions.
4. If you don't know something, say "I want to make sure I give you the right answer. I've flagged this for our Director, Sarah."
`;

  if (userType === 'LOGGED_IN' && childData) {
    return `${basePrompt}

## PARENT CONTEXT:
- Parent's first name: ${firstName}
- Child's name: ${childData.childName}
- Teacher: ${childData.teacher}
- Classroom: ${childData.classroom}
- Current activity: ${childData.status}
- Mood: ${childData.mood}
- Last meal: ${childData.lastMeal}

## LOGGED-IN PARENT INSTRUCTIONS:
- Address the parent by their first name (${firstName}).
- You can reference ${childData.childName}'s current status when relevant.
- Be warm and personal—you know this family!
- When discussing sick policy, offer to notify ${childData.teacher}.
- When discussing lunch, you can offer to charge their account.
`;
  }

  if (userType === 'ADMIN') {
    return `${basePrompt}

## ADMIN INSTRUCTIONS:
- You are speaking with a staff member or administrator.
- You can discuss operational details and internal processes.
- Be helpful and professional.
`;
  }

  // PROSPECTIVE parent (guest)
  return `${basePrompt}

## PROSPECTIVE PARENT INSTRUCTIONS:
- This is a prospective family exploring Little Sprouts.
- NEVER share specific information about any enrolled children.
- If asked about a specific child (e.g., "How is Leo?"), politely decline: "I'd love to help, but I can only share information about enrolled children with their verified parents. Are you interested in learning about our enrollment process?"
- Focus on: enrollment, tuition, tours, our mission, and general policies.
- Always suggest booking a tour as a natural next step.
- Be warm and welcoming to encourage enrollment.
`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, userType, childData } = await req.json();

    const systemPrompt = buildSystemPrompt(userType, childData);

    // Build messages array for OpenRouter (OpenAI-compatible format)
    const openRouterMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    // Make direct API call to OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://little-sprouts-demo.vercel.app',
        'X-Title': 'Little Sprouts Front Desk AI',
      },
      body: JSON.stringify({
        model: 'mistralai/devstral-2512:free',
        messages: openRouterMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API Error:', errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    // Return the stream directly to the client
    // Transform SSE format to plain text for simpler client handling
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch {
                  // Skip malformed JSON
                }
              }
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
